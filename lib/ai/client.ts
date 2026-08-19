import Anthropic from "@anthropic-ai/sdk";
import Groq from "groq-sdk";

// Sonnet 5: mais rápido/barato que Opus 5 para este padrão de uso (decidir
// qual tool chamar + narrar um JSON pequeno), alinhado à meta de ~8s de
// resposta numa demo ao vivo (RNF02 de docs/requisitos.md).
export const MODEL_ID = "claude-sonnet-5";

// Modelo de fallback (ver lib/ai/orchestrator.ts): usado somente se a chamada
// à Anthropic falhar (ex.: sem créditos, indisponibilidade). gpt-oss-120b é
// o modelo open-weight de maior qualidade disponível na Groq com suporte a
// tool use, rodando em hardware Groq (LPU) rápido o suficiente para não
// comprometer RNF02 mesmo como plano B.
export const GROQ_MODEL_ID = "openai/gpt-oss-120b";

let cachedAnthropicClient: Anthropic | null = null;
let cachedGroqClient: Groq | null = null;

// Server-only: nunca importar este módulo de um Client Component ("use client").
export function getAnthropicClient(): Anthropic {
  if (cachedAnthropicClient) return cachedAnthropicClient;

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      "ANTHROPIC_API_KEY não configurada. Defina-a em .env (veja .env.exemplo).",
    );
  }

  cachedAnthropicClient = new Anthropic({ apiKey, timeout: 15_000 });
  return cachedAnthropicClient;
}

// Server-only, mesma regra do client Anthropic acima.
export function getGroqClient(): Groq {
  if (cachedGroqClient) return cachedGroqClient;

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GROQ_API_KEY não configurada. Defina-a em .env (veja .env.exemplo).",
    );
  }

  cachedGroqClient = new Groq({ apiKey, timeout: 15_000 });
  return cachedGroqClient;
}
