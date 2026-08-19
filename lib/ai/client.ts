import Anthropic from "@anthropic-ai/sdk";

// Sonnet 5: mais rápido/barato que Opus 5 para este padrão de uso (decidir
// qual tool chamar + narrar um JSON pequeno), alinhado à meta de ~8s de
// resposta numa demo ao vivo (RNF02 de docs/requisitos.md).
export const MODEL_ID = "claude-sonnet-5";

let cachedClient: Anthropic | null = null;

// Server-only: nunca importar este módulo de um Client Component ("use client").
export function getAnthropicClient(): Anthropic {
  if (cachedClient) return cachedClient;

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      "ANTHROPIC_API_KEY não configurada. Defina-a em .env (veja .env.exemplo).",
    );
  }

  cachedClient = new Anthropic({ apiKey, timeout: 15_000 });
  return cachedClient;
}
