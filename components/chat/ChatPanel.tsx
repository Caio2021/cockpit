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
      <div className="p-4 border-b border-neutral-200 dark:border-neutral-800">
        <h2 className="text-sm font-semibold">Pergunte ao Cockpit</h2>
        <p className="text-xs text-neutral-500">
          Respostas em linguagem natural, com indicadores citados dos dados
          monitorados.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-xs text-neutral-500 space-y-2">
            <p>Experimente perguntar:</p>
            <ul className="space-y-1">
              {PERGUNTAS_SUGERIDAS.map((p) => (
                <li key={p}>
                  <button
                    type="button"
                    onClick={() => void sendMessage(p)}
                    className="text-left underline decoration-dotted hover:text-neutral-800 dark:hover:text-neutral-200"
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
          <div className="flex justify-start">
            <div className="rounded-lg px-3 py-2 text-sm bg-neutral-100 dark:bg-neutral-800 text-neutral-500 animate-pulse">
              Pensando...
            </div>
          </div>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="p-3 border-t border-neutral-200 dark:border-neutral-800 flex gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Digite sua pergunta..."
          className="flex-1 rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-400"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="rounded-md bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 px-4 py-2 text-sm font-medium disabled:opacity-40"
        >
          Enviar
        </button>
      </form>
    </div>
  );
}
