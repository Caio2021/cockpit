import type { Empreendimento } from "../data/types";
import { classificarScore, type Classificacao } from "./util";

const PESO_CRITICIDADE_FORNECEDOR: Record<string, number> = {
  alta: 18,
  media: 9,
  baixa: 3,
};

export interface RiscoAtraso {
  score: number; // 0-100
  classificacao: Classificacao;
  indicadores: {
    percentualAtrasado: number;
    atividadesCriticasAtrasadas: number;
    fornecedoresAtrasadosImpactando: Array<{
      fornecedorNome: string;
      diasAtrasoHistorico: number;
      criticidade: string;
    }>;
  };
}

// Fórmula documentada (RNF03/RNF04 — precisa ser explicável ao vivo):
// score = min(100,
//   percentualAtrasado do cronograma * 1.8
//   + atividadesCriticasAtrasadas * 4
//   + soma, por fornecedor com histórico de atraso > 0, do peso de sua
//     criticidade (alta=18, média=9, baixa=3)
// )
export function calcularRiscoAtraso(emp: Empreendimento): RiscoAtraso {
  const fornecedoresAtrasadosImpactando = emp.fornecedoresCriticos.filter(
    (f) => f.diasAtrasoHistorico > 0,
  );

  const penalidadeFornecedores = fornecedoresAtrasadosImpactando.reduce(
    (acc, f) => acc + PESO_CRITICIDADE_FORNECEDOR[f.criticidade],
    0,
  );

  const scoreBruto =
    emp.cronograma.percentualAtrasado * 1.8 +
    emp.cronograma.atividadesCriticasAtrasadas * 4 +
    penalidadeFornecedores;

  const score = Math.min(100, Math.round(scoreBruto));

  return {
    score,
    classificacao: classificarScore(score),
    indicadores: {
      percentualAtrasado: emp.cronograma.percentualAtrasado,
      atividadesCriticasAtrasadas: emp.cronograma.atividadesCriticasAtrasadas,
      fornecedoresAtrasadosImpactando: fornecedoresAtrasadosImpactando.map(
        (f) => ({
          fornecedorNome: f.fornecedorNome,
          diasAtrasoHistorico: f.diasAtrasoHistorico,
          criticidade: f.criticidade,
        }),
      ),
    },
  };
}
