import type { Empreendimento } from "../data/types";
import { classificarScore, diasAte, type Classificacao } from "./util";

export interface RiscoFinanceiro {
  score: number; // 0-100
  classificacao: Classificacao;
  indicadores: {
    percentualEstouroOrcamento: number;
    orcamentoPrevisto: number;
    orcamentoRealizado: number;
    contratosComReajusteProximo: Array<{
      fornecedorId: string;
      dataProximoReajuste: string;
      indice: string;
      percentualIndiceProjetado: number;
      diasAteReajuste: number;
    }>;
  };
}

// Fórmula documentada (RNF03/RNF04):
// percentualEstouro = (realizado - previsto) / previsto * 100 (mínimo 0 para o score)
// penalidadeContratos = soma, por contrato, de:
//   - percentualIndiceProjetado * 3, se o reajuste ocorre em até 60 dias
//   - percentualIndiceProjetado * 1, se ocorre entre 61 e 120 dias
//   - 0, caso contrário
// score = min(100, round(max(0, percentualEstouro) * 2 + penalidadeContratos))
export function calcularRiscoFinanceiro(emp: Empreendimento): RiscoFinanceiro {
  const percentualEstouro =
    ((emp.orcamento.realizado - emp.orcamento.previsto) /
      emp.orcamento.previsto) *
    100;

  const contratosComReajusteProximo = emp.contratos
    .map((c) => ({ ...c, diasAteReajuste: diasAte(c.dataProximoReajuste) }))
    .filter((c) => c.diasAteReajuste <= 120);

  const penalidadeContratos = contratosComReajusteProximo.reduce((acc, c) => {
    if (c.diasAteReajuste <= 60) return acc + c.percentualIndiceProjetado * 3;
    return acc + c.percentualIndiceProjetado * 1;
  }, 0);

  const scoreBruto = Math.max(0, percentualEstouro) * 2 + penalidadeContratos;
  const score = Math.min(100, Math.round(scoreBruto));

  return {
    score,
    classificacao: classificarScore(score),
    indicadores: {
      percentualEstouroOrcamento: Math.round(percentualEstouro * 10) / 10,
      orcamentoPrevisto: emp.orcamento.previsto,
      orcamentoRealizado: emp.orcamento.realizado,
      contratosComReajusteProximo,
    },
  };
}
