import type { ReactNode } from "react";
import type { ChatMessage as ChatMessageType } from "./useChat";

// A UI não renderiza markdown (RNF06 — sem dependência de lib de markdown).
// O system prompt já instrui o modelo a não usar markdown, mas nem todo
// provedor/modelo obedece sempre (ex.: fallback Groq) — então limpamos aqui
// como defesa em profundidade, em vez de depender só do prompt.
function limparMarkdown(texto: string): string {
  return texto
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/(?<!\*)\*(?!\*)(.*?)\*(?!\*)/g, "$1")
    .replace(/^#{1,6}\s+/, "");
}

function renderConteudo(content: string) {
  const linhas = content.split("\n");
  const blocos: ReactNode[] = [];
  let itensLista: string[] = [];

  const flushLista = (key: string) => {
    if (itensLista.length === 0) return;
    blocos.push(
      <ul key={key} className="list-disc pl-5 space-y-0.5">
        {itensLista.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>,
    );
    itensLista = [];
  };

  linhas.forEach((linha, i) => {
    const trimmed = limparMarkdown(linha.trim());
    const marcador = trimmed.match(/^[-•]\s+(.*)/);
    if (marcador) {
      itensLista.push(marcador[1]);
      return;
    }
    flushLista(`lista-${i}`);
    if (trimmed) blocos.push(<p key={`p-${i}`}>{trimmed}</p>);
  });
  flushLista("lista-final");

  return blocos;
}

export default function ChatMessage({ message }: { message: ChatMessageType }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-lg px-3 py-2 text-sm space-y-1 ${
          isUser
            ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900"
            : message.isError
              ? "bg-red-50 text-red-800 border border-red-200"
              : "bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100"
        }`}
      >
        {renderConteudo(message.content)}
      </div>
    </div>
  );
}
