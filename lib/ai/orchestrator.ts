import type Anthropic from "@anthropic-ai/sdk";
import type Groq from "groq-sdk";
import { getAnthropicClient, getGroqClient, GROQ_MODEL_ID, MODEL_ID } from "./client";
import { SYSTEM_PROMPT } from "./systemPrompt";
import { TOOLS, GROQ_TOOLS } from "./tools/definitions";
import { executeTool } from "./tools/handlers";

export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

// Truncamento do histórico reenviado a cada chamada (seção 6 do
// docs/arquitetura.md) — evita estourar tokens/latência numa demo longa.
const MAX_HISTORY_TURNS = 10;

function extractAnthropicText(response: Anthropic.Message): string {
  return response.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n\n");
}

// Número máximo de idas e voltas de ferramenta antes de exigir uma resposta
// final. Com o acesso livre ao schema, uma pergunta comum gasta três rodadas
// (listarTabelas -> descreverTabela -> consultarBase) e ainda sobra folga para
// a LLM corrigir um SQL que falhou.
const MAX_RODADAS_TOOL = 8;

async function executarBlocos(
  blocos: Anthropic.ToolUseBlock[],
): Promise<Anthropic.ToolResultBlockParam[]> {
  return Promise.all(
    blocos.map(async (block) => {
      try {
        const { output, isError } = await executeTool(
          block.name,
          block.input as Record<string, unknown>,
        );
        return {
          type: "tool_result" as const,
          tool_use_id: block.id,
          content: JSON.stringify(output),
          is_error: isError ?? false,
        };
      } catch {
        // Falha inesperada dentro do handler (bug, não erro de negócio) —
        // nunca deixa a conversa quebrar; vira um tool_result de erro normal.
        return {
          type: "tool_result" as const,
          tool_use_id: block.id,
          content: JSON.stringify({ erro: "Falha interna ao executar a ferramenta." }),
          is_error: true,
        };
      }
    }),
  );
}

// Loop de tool use via Anthropic: encadeia rodadas até a LLM parar de pedir
// ferramenta (ou até o teto de rodadas). A LLM nunca calcula — este módulo só
// decide, via `tools`, o que chamar, e devolve o resultado determinístico de
// `executeTool` para o Claude narrar.
async function runChatAnthropic(message: string, history: ChatTurn[]): Promise<string> {
  const client = getAnthropicClient();

  const messages: Anthropic.MessageParam[] = [
    ...history.slice(-MAX_HISTORY_TURNS),
    { role: "user", content: message },
  ];

  for (let rodada = 0; rodada < MAX_RODADAS_TOOL; rodada++) {
    const ultimaRodada = rodada === MAX_RODADAS_TOOL - 1;

    const resposta = await client.messages.create({
      model: MODEL_ID,
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      tools: TOOLS,
      // Na última rodada as ferramentas ainda vão no request (o histórico tem
      // tool_use e a API exige o schema), mas forçamos o encerramento.
      tool_choice: ultimaRodada ? { type: "none" } : { type: "auto" },
      messages,
    });

    if (resposta.stop_reason !== "tool_use") return extractAnthropicText(resposta);

    const blocos = resposta.content.filter(
      (b): b is Anthropic.ToolUseBlock => b.type === "tool_use",
    );

    messages.push({ role: "assistant", content: resposta.content });
    messages.push({ role: "user", content: await executarBlocos(blocos) });
  }

  return "Consultei a base várias vezes e não cheguei a uma resposta fechada. Pode reformular a pergunta?";
}

// Mesmo desenho do loop acima, só que contra a API Groq (formato compatível
// com OpenAI). Usado exclusivamente como fallback quando a Anthropic falha
// (ex.: sem créditos) — ver runChat(). Reaproveita SYSTEM_PROMPT e
// executeTool: a única diferença real é o formato de request/response da API.
async function runChatGroq(message: string, history: ChatTurn[]): Promise<string> {
  const client = getGroqClient();

  const messages: Groq.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: "system", content: SYSTEM_PROMPT },
    ...history
      .slice(-MAX_HISTORY_TURNS)
      .map((h) => ({ role: h.role, content: h.content }) as Groq.Chat.Completions.ChatCompletionMessageParam),
    { role: "user", content: message },
  ];

  for (let rodada = 0; rodada < MAX_RODADAS_TOOL; rodada++) {
    const ultimaRodada = rodada === MAX_RODADAS_TOOL - 1;

    const resposta = await client.chat.completions.create({
      model: GROQ_MODEL_ID,
      max_tokens: 2048,
      messages,
      tools: GROQ_TOOLS,
      tool_choice: ultimaRodada ? "none" : "auto",
    });

    const mensagem = resposta.choices[0]?.message;
    const toolCalls = mensagem?.tool_calls;

    if (!mensagem || !toolCalls || toolCalls.length === 0) {
      return mensagem?.content ?? "";
    }

    const resultados: Groq.Chat.Completions.ChatCompletionMessageParam[] = await Promise.all(
      toolCalls.map(async (call) => {
        let output: unknown;
        try {
          const input = JSON.parse(call.function.arguments || "{}") as Record<string, unknown>;
          output = (await executeTool(call.function.name, input)).output;
        } catch {
          output = { erro: "Falha interna ao executar a ferramenta." };
        }
        return { role: "tool" as const, tool_call_id: call.id, content: JSON.stringify(output) };
      }),
    );

    messages.push({ role: "assistant", content: mensagem.content, tool_calls: toolCalls });
    messages.push(...resultados);
  }

  return "Consultei a base várias vezes e não cheguei a uma resposta fechada. Pode reformular a pergunta?";
}

// Ponto de entrada único usado por app/api/chat/route.ts. Tenta Anthropic
// primeiro (provedor padrão); se falhar por qualquer motivo (sem créditos,
// indisponibilidade, timeout), cai para Groq como plano B antes de reportar
// erro ao usuário. Erros de negócio (tool não encontrada, empreendimento
// inexistente) nunca chegam aqui — já viram parte da resposta normal dentro
// de runChatAnthropic/runChatGroq.
export async function runChat(message: string, history: ChatTurn[]): Promise<string> {
  try {
    return await runChatAnthropic(message, history);
  } catch (anthropicErr) {
    console.error(
      "Anthropic indisponível, tentando fallback Groq:",
      anthropicErr instanceof Error ? anthropicErr.message : "erro desconhecido",
    );
    try {
      return await runChatGroq(message, history);
    } catch (groqErr) {
      console.error(
        "Fallback Groq também falhou:",
        groqErr instanceof Error ? groqErr.message : "erro desconhecido",
      );
      // Propaga o erro original da Anthropic — é o provedor padrão, então é
      // o mais relevante para diagnóstico caso os dois falhem.
      throw anthropicErr;
    }
  }
}
