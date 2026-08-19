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

// Loop de tool use via Anthropic: no máximo uma ida e volta extra à API (não
// é um loop genérico multi-turno — os handlers não encadeiam entre si). A
// LLM nunca calcula: este módulo só decide, via `tools`, o que chamar, e
// repassa o resultado determinístico de `executeTool` de volta para o Claude
// narrar.
async function runChatAnthropic(message: string, history: ChatTurn[]): Promise<string> {
  const client = getAnthropicClient();

  const baseMessages: Anthropic.MessageParam[] = [
    ...history.slice(-MAX_HISTORY_TURNS),
    { role: "user", content: message },
  ];

  const first = await client.messages.create({
    model: MODEL_ID,
    max_tokens: 2048,
    system: SYSTEM_PROMPT,
    tools: TOOLS,
    messages: baseMessages,
  });

  if (first.stop_reason !== "tool_use") return extractAnthropicText(first);

  const toolUseBlocks = first.content.filter(
    (b): b is Anthropic.ToolUseBlock => b.type === "tool_use",
  );

  const toolResults: Anthropic.ToolResultBlockParam[] = toolUseBlocks.map((block) => {
    try {
      const { output, isError } = executeTool(
        block.name,
        block.input as Record<string, unknown>,
      );
      return {
        type: "tool_result",
        tool_use_id: block.id,
        content: JSON.stringify(output),
        is_error: isError ?? false,
      };
    } catch {
      // Falha inesperada dentro do handler (bug, não erro de negócio) —
      // nunca deixa a conversa quebrar; vira um tool_result de erro normal.
      return {
        type: "tool_result",
        tool_use_id: block.id,
        content: JSON.stringify({ erro: "Falha interna ao executar a ferramenta." }),
        is_error: true,
      };
    }
  });

  const second = await client.messages.create({
    model: MODEL_ID,
    max_tokens: 2048,
    system: SYSTEM_PROMPT,
    tools: TOOLS,
    messages: [
      ...baseMessages,
      { role: "assistant", content: first.content },
      { role: "user", content: toolResults },
    ],
  });

  const text = extractAnthropicText(second);
  return (
    text ||
    "Encontrei mais dados para consultar, mas não consegui concluir a resposta agora. Pode reformular a pergunta?"
  );
}

// Mesmo desenho do loop acima, só que contra a API Groq (formato compatível
// com OpenAI). Usado exclusivamente como fallback quando a Anthropic falha
// (ex.: sem créditos) — ver runChat(). Reaproveita SYSTEM_PROMPT e
// executeTool: a única diferença real é o formato de request/response da API.
async function runChatGroq(message: string, history: ChatTurn[]): Promise<string> {
  const client = getGroqClient();

  const baseMessages: Groq.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: "system", content: SYSTEM_PROMPT },
    ...history.slice(-MAX_HISTORY_TURNS).map((h) => ({ role: h.role, content: h.content }) as Groq.Chat.Completions.ChatCompletionMessageParam),
    { role: "user", content: message },
  ];

  const first = await client.chat.completions.create({
    model: GROQ_MODEL_ID,
    max_tokens: 2048,
    messages: baseMessages,
    tools: GROQ_TOOLS,
  });

  const firstMessage = first.choices[0]?.message;
  const toolCalls = firstMessage?.tool_calls;

  if (!toolCalls || toolCalls.length === 0) {
    return firstMessage?.content ?? "";
  }

  const toolResultMessages: Groq.Chat.Completions.ChatCompletionMessageParam[] = toolCalls.map(
    (call) => {
      let output: unknown;
      try {
        const input = JSON.parse(call.function.arguments || "{}") as Record<string, unknown>;
        output = executeTool(call.function.name, input).output;
      } catch {
        output = { erro: "Falha interna ao executar a ferramenta." };
      }
      return { role: "tool", tool_call_id: call.id, content: JSON.stringify(output) };
    },
  );

  const second = await client.chat.completions.create({
    model: GROQ_MODEL_ID,
    max_tokens: 2048,
    messages: [
      ...baseMessages,
      { role: "assistant", content: firstMessage.content, tool_calls: toolCalls },
      ...toolResultMessages,
    ],
    tools: GROQ_TOOLS,
  });

  const text = second.choices[0]?.message?.content ?? "";
  return (
    text ||
    "Encontrei mais dados para consultar, mas não consegui concluir a resposta agora. Pode reformular a pergunta?"
  );
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
