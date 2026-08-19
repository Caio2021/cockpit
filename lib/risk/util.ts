// Data de referência fixa para cálculos de "dias até o reajuste".
// Fixada (em vez de usar `new Date()`) para que os fixtures — desenhados em
// torno dela — e os resultados de risco/simulação sejam sempre reprodutíveis.
export const HOJE_REFERENCIA = new Date("2026-08-18T00:00:00Z");

export function diasAte(dataISO: string): number {
  const alvo = new Date(`${dataISO}T00:00:00Z`);
  const diffMs = alvo.getTime() - HOJE_REFERENCIA.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

export type Classificacao = "alto" | "medio" | "baixo";

// Faixas documentadas: >=66 alto, 33-65 médio, <33 baixo.
export function classificarScore(score: number): Classificacao {
  if (score >= 66) return "alto";
  if (score >= 33) return "medio";
  return "baixo";
}
