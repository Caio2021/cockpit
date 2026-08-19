import { NextResponse } from "next/server";
import { runChat, type ChatTurn } from "@/lib/ai/orchestrator";

// Contrato:
// POST { message: string, history?: { role: "user"|"assistant", content: string }[] }
// -> 200 { reply: string }
// -> 4xx/5xx { error: string }
export async function POST(req: Request) {
  let body: { message?: string; history?: ChatTurn[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corpo da requisição inválido." }, { status: 400 });
  }

  const { message, history } = body;
  if (!message || typeof message !== "string" || !message.trim()) {
    return NextResponse.json({ error: "Mensagem não pode ser vazia." }, { status: 400 });
  }

  try {
    const reply = await runChat(message, Array.isArray(history) ? history : []);
    return NextResponse.json({ reply });
  } catch (err) {
    // Loga só a mensagem de erro — nunca o body/history, que pode conter
    // indicadores financeiros (REGRAS_SEGURANCA.md).
    console.error("Erro em /api/chat:", err instanceof Error ? err.message : "erro desconhecido");
    return NextResponse.json(
      { error: "Não consegui processar sua pergunta agora. Tente novamente em instantes." },
      { status: 502 },
    );
  }
}
