"use client";

import { useCallback, useState } from "react";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  isError?: boolean;
}

const MENSAGEM_ERRO =
  "Não consegui processar sua pergunta agora. Verifique sua conexão e tente novamente.";

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useCallback(
    async (text: string) => {
      const userMsg: ChatMessage = { id: crypto.randomUUID(), role: "user", content: text };
      const historyToSend = [...messages, userMsg].map(({ role, content }) => ({
        role,
        content,
      }));

      setMessages((prev) => [...prev, userMsg]);
      setIsLoading(true);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: text, history: historyToSend }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => null);
          throw new Error(data?.error ?? MENSAGEM_ERRO);
        }

        const { reply } = (await res.json()) as { reply: string };
        setMessages((prev) => [
          ...prev,
          { id: crypto.randomUUID(), role: "assistant", content: reply },
        ]);
      } catch {
        setMessages((prev) => [
          ...prev,
          { id: crypto.randomUUID(), role: "assistant", content: MENSAGEM_ERRO, isError: true },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [messages],
  );

  return { messages, isLoading, sendMessage };
}
