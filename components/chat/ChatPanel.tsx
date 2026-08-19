"use client";

import { useState, type FormEvent } from "react";
import { useChat } from "./useChat";
import ChatMessage from "./ChatMessage";

const PERGUNTAS_SUGERIDAS = [
  "Qual empreendimento apresenta maior risco?",
  "Explique o motivo.",
  "Gere um plano de ação.",
  "Simule um atraso de 30 dias. Quanto isso impacta o fluxo de caixa?",
];

export default function ChatPanel() {
  const { messages, isLoading, sendMessage } = useChat();
  const [input, setInput] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const texto = input.trim();
    if (!texto || isLoading) return;
    setInput("");
    void sendMessage(texto);
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="p-6 border-b border-outline-variant/50 bg-surface-container-lowest/50 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-primary-container/10 flex items-center justify-center text-primary-container shadow-sm border border-primary-container/20">
          <span className="material-symbols-outlined text-[28px]">smart_toy</span>
        </div>
        <div>
          <h2 className="font-headline-md text-headline-md text-on-surface font-bold">
            Pergunte ao Cockpit
          </h2>
          <p className="font-label-sm text-label-sm text-on-surface-variant uppercase mt-1 tracking-wide">
            Respostas com IA
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 bg-surface/30">
        {messages.length === 0 && (
          <div className="font-body-md text-body-md text-on-surface-variant">
            <p className="mb-3">Experimente perguntar:</p>
            <ul className="space-y-2">
              {PERGUNTAS_SUGERIDAS.map((p) => (
                <li key={p}>
                  <button
                    type="button"
                    onClick={() => void sendMessage(p)}
                    className="text-left text-primary-container underline decoration-dotted hover:opacity-80"
                  >
                    {p}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {messages.map((m) => (
          <ChatMessage key={m.id} message={m} />
        ))}

        {isLoading && (
          <div className="self-start max-w-[95%] bg-surface-container-lowest rounded-2xl rounded-tl-sm p-4 shadow-md border border-outline-variant/30">
            <div className="flex items-center gap-2 font-body-md text-body-md text-on-surface-variant animate-pulse">
              <span className="material-symbols-outlined text-primary-container text-[18px]">
                auto_awesome
              </span>
              Pensando...
            </div>
          </div>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="p-5 border-t border-outline-variant/50 bg-surface-container-lowest/80 backdrop-blur-sm"
      >
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Digite sua pergunta para a IA..."
            disabled={isLoading}
            className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl pl-5 pr-14 py-4 text-body-md text-on-surface focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 transition-all shadow-sm"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-primary-container p-2 rounded-lg transition-colors hover:bg-primary-container/10 flex items-center justify-center h-10 w-10 disabled:opacity-40"
          >
            <span className="material-symbols-outlined text-[24px]">send</span>
          </button>
        </div>
      </form>
    </div>
  );
}
