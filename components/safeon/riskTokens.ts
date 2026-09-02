export type Classificacao = "alto" | "medio" | "baixo";

// Classes Tailwind completas (nunca concatenadas em runtime) para que o
// scanner do Tailwind as encontre — cada classificação de risco mapeia para
// um token de cor fixo do tema definido em app/globals.css.
export interface RiskTokens {
  borderBg: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  dotBg: string;
  meterBg: string;
  label: string;
}

export const RISK_TOKENS: Record<Classificacao, RiskTokens> = {
  alto: {
    borderBg: "bg-error",
    badgeBg: "bg-error/10",
    badgeBorder: "border-error/20",
    badgeText: "text-error",
    dotBg: "bg-error",
    meterBg: "bg-error",
    label: "Risco alto",
  },
  medio: {
    borderBg: "bg-primary-container",
    badgeBg: "bg-primary-container/10",
    badgeBorder: "border-primary-container/25",
    badgeText: "text-primary-container",
    dotBg: "bg-primary-container",
    meterBg: "bg-primary-container",
    label: "Risco médio",
  },
  baixo: {
    borderBg: "bg-tertiary",
    badgeBg: "bg-tertiary/10",
    badgeBorder: "border-tertiary/20",
    badgeText: "text-tertiary",
    dotBg: "bg-tertiary",
    meterBg: "bg-tertiary",
    label: "Risco baixo",
  },
};

// Faixas documentadas: >=66 alto, 33-65 médio, <33 baixo.
export function classificarScore(score: number): Classificacao {
  if (score >= 66) return "alto";
  if (score >= 33) return "medio";
  return "baixo";
}
