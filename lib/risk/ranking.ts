import { getEmpreendimentos } from "../data/repository";
import { calcularRiscoAtraso, type RiscoAtraso } from "./calcularRiscoAtraso";
import {
  calcularRiscoFinanceiro,
  type RiscoFinanceiro,
} from "./calcularRiscoFinanceiro";
import type { Classificacao } from "./util";

export interface RiscoEmpreendimento {
  id: string;
  nome: string;
  cidade: string;
  riscoAtraso: RiscoAtraso;
  riscoFinanceiro: RiscoFinanceiro;
  riscoGeral: {
    score: number;
    classificacao: Classificacao;
  };
}

// Risco geral = média ponderada (60% atraso, 40% financeiro). Pondera mais o
// atraso porque, no case, o atraso é o gatilho mais citado pelos diretores
// ("qual obra está com maior risco de atraso" é a primeira pergunta-âncora) —
// mas o risco financeiro tem peso relevante, pois pode ser o fator decisivo
// mesmo num empreendimento sem atraso severo.
function calcularRiscoGeral(riscoAtraso: number, riscoFinanceiro: number) {
  const score = Math.round(riscoAtraso * 0.6 + riscoFinanceiro * 0.4);
  return {
    score,
    classificacao:
      score >= 66 ? ("alto" as const) : score >= 33 ? ("medio" as const) : ("baixo" as const),
  };
}

export function getRankingRisco(): RiscoEmpreendimento[] {
  return getEmpreendimentos()
    .map((emp) => {
      const riscoAtraso = calcularRiscoAtraso(emp);
      const riscoFinanceiro = calcularRiscoFinanceiro(emp);
      return {
        id: emp.id,
        nome: emp.nome,
        cidade: emp.cidade,
        riscoAtraso,
        riscoFinanceiro,
        riscoGeral: calcularRiscoGeral(riscoAtraso.score, riscoFinanceiro.score),
      };
    })
    .sort((a, b) => b.riscoGeral.score - a.riscoGeral.score);
}

export function getRankingRiscoFinanceiro(): RiscoEmpreendimento[] {
  return [...getRankingRisco()].sort(
    (a, b) => b.riscoFinanceiro.score - a.riscoFinanceiro.score,
  );
}
