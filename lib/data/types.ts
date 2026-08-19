export type Criticidade = "alta" | "media" | "baixa";

export interface FornecedorCritico {
  fornecedorId: string;
  fornecedorNome: string;
  categoria: string;
  diasAtrasoHistorico: number;
  criticidade: Criticidade;
}

export interface Contrato {
  fornecedorId: string;
  dataProximoReajuste: string; // ISO date
  indice: string; // ex: "INCC", "IPCA"
  percentualIndiceProjetado: number; // % projetado de reajuste
}

export interface PontoFluxoCaixa {
  mes: string; // ex: "2026-09"
  entradas: number;
  saidas: number;
}

export interface Empreendimento {
  id: string;
  nome: string;
  cidade: string;
  cronograma: {
    percentualConcluido: number;
    percentualAtrasado: number; // 0-100, quanto o cronograma está atrasado em relação ao planejado
    atividadesCriticasAtrasadas: number;
  };
  orcamento: {
    previsto: number;
    realizado: number;
  };
  fornecedoresCriticos: FornecedorCritico[];
  contratos: Contrato[];
  fluxoCaixaProjetado: PontoFluxoCaixa[];
  custoFixoMensal: number; // base para simulação de impacto de atraso
}
