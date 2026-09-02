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
      <ul key={key} className="pl-4 space-y-2 border-l-2 border-outline-variant">
        {itensLista.map((item, i) => (
          <li
            key={i}
            className="relative before:content-[''] before:absolute before:w-1.5 before:h-1.5 before:bg-primary-container before:rounded-full before:-left-5 before:top-2"
          >
            {item}
          </li>
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

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="self-end max-w-[85%] bg-navy-800 text-pure-white rounded-xl rounded-tr-sm px-4 py-3">
          <p className="font-body-md text-body-md">{message.content}</p>
        </div>
      </div>
    );
  }

  if (message.isError) {
    return (
      <div className="flex justify-start">
        <div className="self-start max-w-[95%] bg-error/10 border border-error/20 text-error rounded-xl rounded-tl-sm px-4 py-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">error</span>
          <p className="font-body-md text-body-md">{message.content}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start">
      <div className="self-start max-w-[95%] bg-surface rounded-xl rounded-tl-sm p-4 border border-outline-variant">
        <div className="flex items-center gap-2 mb-3 pb-3 border-b border-outline-variant">
          <span className="material-symbols-outlined text-primary-container text-sm">auto_awesome</span>
          <span className="font-label-sm text-label-sm text-primary-container font-semibold">
            SafeChat
          </span>
        </div>
        <div className="font-body-md text-body-md text-on-surface-variant space-y-3">
          {renderConteudo(message.content)}
        </div>
      </div>
    </div>
  );
}
