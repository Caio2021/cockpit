import type { Classificacao } from "@/lib/risk/util";

// Paleta de status (fixa, nunca temática) — cores reservadas para estado de
// risco, sempre acompanhadas de rótulo em texto (nunca só a cor). Mesmos
// hex em claro/escuro (ambos ≥3:1 na respectiva superfície).
export const STATUS: Record<Classificacao, { hex: string; label: string }> = {
  baixo: { hex: "#0ca30c", label: "Risco baixo" },
  medio: { hex: "#fab219", label: "Risco médio" },
  alto: { hex: "#d03b3b", label: "Risco alto" },
};
