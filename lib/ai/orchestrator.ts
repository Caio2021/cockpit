import type Anthropic from "@anthropic-ai/sdk";
import { getAnthropicClient, MODEL_ID } from "./client";
import { SYSTEM_PROMPT } from "./systemPrompt";
import { TOOLS } from "./tools/definitions";
import { executeTool } from "./tools/handlers";

export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

// Truncamento do histórico reenviado a cada chamada (seção 6 do
// docs/arquitetura.md) — evita estourar tokens/latência numa demo longa.
const MAX_HISTORY_TURNS = 10;

function extractText(response: Anthropic.Message): string {
  return response.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n\n");
}

// Loop de tool use: no máximo uma ida e volta extra à API Anthropic (não é
// um loop genérico multi-turno — os handlers não encadeiam entre si). A LLM
// nunca calcula: este módulo só decide, via `tools`, o que chamar, e repassa
// o resultado determinístico de `executeTool` de volta para o Claude narrar.
export async function runChat(message: string, history: ChatTurn[]): Promise<string> {
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

  if (first.stop_reason !== "tool_use") return extractText(first);

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

  const text = extractText(second);
  return (
    text ||
    "Encontrei mais dados para consultar, mas não consegui concluir a resposta agora. Pode reformular a pergunta?"
  );
}
