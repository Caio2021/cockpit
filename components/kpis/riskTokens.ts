import type { Classificacao } from "@/lib/risk/util";

// Classes Tailwind completas (nunca concatenadas em runtime) para que o
// scanner do Tailwind as encontre — cada classificação de risco mapeia para
// um token de cor fixo do tema M3 definido em app/globals.css.
export interface RiskTokens {
  borderBg: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  dotBg: string;
  ringStroke: string;
  label: string;
}

export const RISK_TOKENS: Record<Classificacao, RiskTokens> = {
  alto: {
    borderBg: "bg-error",
    badgeBg: "bg-error/10",
    badgeBorder: "border-error/20",
    badgeText: "text-error",
    dotBg: "bg-error",
    ringStroke: "stroke-error",
    label: "Risco alto",
  },
  medio: {
    borderBg: "bg-primary-container",
    badgeBg: "bg-primary-container/10",
    badgeBorder: "border-primary-container/20",
    badgeText: "text-primary-container",
    dotBg: "bg-primary-container",
    ringStroke: "stroke-primary-container",
    label: "Risco médio",
  },
  baixo: {
    borderBg: "bg-tertiary",
    badgeBg: "bg-tertiary/10",
    badgeBorder: "border-tertiary/20",
    badgeText: "text-tertiary",
    dotBg: "bg-tertiary",
    ringStroke: "stroke-tertiary",
    label: "Risco baixo",
  },
};

// Cor do anel por métrica (independente da classificação geral do card) —
// cada indicador tem sua própria leitura de severidade.
export function ringStrokeAtraso(percentual: number): string {
  if (percentual >= 25) return "stroke-error";
  if (percentual >= 10) return "stroke-primary-container";
  return "stroke-tertiary";
}

export function ringStrokeEstouro(percentual: number): string {
  if (percentual >= 20) return "stroke-error";
  if (percentual >= 10) return "stroke-primary-container";
  return "stroke-tertiary";
}
