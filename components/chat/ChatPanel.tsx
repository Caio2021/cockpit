"use client";

import { useState, type FormEvent } from "react";
import { useChat } from "./useChat";
import ChatMessage from "./ChatMessage";

const PERGUNTAS_SUGERIDAS = [
  "Qual cliente está em maior risco?",
  "Explique o motivo.",
  "Gere um plano de ação.",
  "Quais ordens de trabalho estão paradas há mais tempo?",
];

export default function ChatPanel() {
  const { messages, isLoading, sendMessage, novaConversa } = useChat();
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
      <div className="p-5 border-b border-outline-variant flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary-container/10 flex items-center justify-center text-primary-container shrink-0">
          <span className="material-symbols-outlined text-[22px]">smart_toy</span>
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="font-headline-md text-headline-md text-on-surface">Pergunte ao SafeChat</h2>
          <p className="font-body-md text-body-md text-on-surface-variant truncate">
            Respostas com IA sobre a base do SafeOn
          </p>
        </div>
        <button
          type="button"
          onClick={novaConversa}
          disabled={messages.length === 0 && !isLoading}
          title="Começar uma nova conversa"
          className="shrink-0 flex items-center gap-1.5 border border-outline-variant text-on-surface-variant rounded-lg px-3 py-2 font-label-sm text-label-sm font-medium hover:bg-navy-50 hover:text-on-surface hover:border-navy-100 transition-colors disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-on-surface-variant"
        >
          <span className="material-symbols-outlined text-[18px]">add_comment</span>
          Novo chat
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-b border-outline-variant">
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            className="w-full bg-navy-50 border border-navy-100 rounded-lg pl-4 pr-14 py-3.5 font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/25 transition-colors"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary-container text-pure-white rounded-lg transition-colors hover:opacity-90 flex items-center justify-center h-9 w-9 disabled:bg-surface-variant disabled:text-on-surface-variant"
          >
            <span className="material-symbols-outlined text-[22px]">send</span>
          </button>
        </div>
      </form>

      <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
        {messages.length === 0 && (
          <div className="font-body-md text-body-md text-on-surface-variant">
            <p className="mb-3">Experimente perguntar:</p>
            <ul className="flex flex-col gap-2">
              {PERGUNTAS_SUGERIDAS.map((p) => (
                <li key={p}>
                  <button
                    type="button"
                    onClick={() => void sendMessage(p)}
                    className="w-full text-left border border-outline-variant rounded-lg px-3 py-2.5 text-on-surface hover:border-navy-200 hover:bg-surface-variant transition-colors"
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
          <div className="self-start max-w-[95%] bg-surface-variant rounded-xl px-4 py-3">
            <div className="flex items-center gap-2 font-body-md text-body-md text-on-surface-variant animate-pulse">
              <span className="material-symbols-outlined text-primary-container text-[18px]">
                auto_awesome
              </span>
              Pensando...
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
