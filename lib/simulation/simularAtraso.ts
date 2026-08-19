import { getEmpreendimentoById } from "../data/repository";

export interface ImpactoSimulacaoAtraso {
  empreendimentoId: string;
  empreendimentoNome: string;
  diasAtraso: number;
  impactoReais: number;
  impactoPercentual: number;
  entradasProjetadas6Meses: number;
  explicacaoCalculo: string;
}

// Função pura e determinística (RNF04): mesma entrada sempre produz a mesma
// saída, sem chamada a LLM e sem aleatoriedade.
//
// Regra de cálculo: um atraso de N dias mantém o empreendimento consumindo
// custo fixo mensal (mão de obra, canteiro, financiamento da obra) sem que as
// entradas previstas mudem de patamar — ou seja, o custo fixo do período de
// atraso vira um impacto extra direto no caixa:
//   impactoReais = custoFixoMensal * (diasAtraso / 30)
// impactoPercentual é esse valor relativo ao total de entradas projetadas
// para os próximos 6 meses, para dar noção de proporção ao usuário.
export function simularAtraso(
  empreendimentoId: string,
  diasAtraso: number,
): ImpactoSimulacaoAtraso | null {
  const emp = getEmpreendimentoById(empreendimentoId);
  if (!emp) return null;

  const impactoReais = Math.round(emp.custoFixoMensal * (diasAtraso / 30));

  const entradasProjetadas6Meses = emp.fluxoCaixaProjetado.reduce(
    (acc, ponto) => acc + ponto.entradas,
    0,
  );

  const impactoPercentual =
    entradasProjetadas6Meses > 0
      ? Math.round((impactoReais / entradasProjetadas6Meses) * 1000) / 10
      : 0;

  const mesesEquivalentes = Math.round((diasAtraso / 30) * 100) / 100;

  const explicacaoCalculo =
    `Custo fixo mensal de R$ ${emp.custoFixoMensal.toLocaleString("pt-BR")} ` +
    `aplicado proporcionalmente a ${diasAtraso} dias de atraso ` +
    `(equivalente a ${mesesEquivalentes} meses de custo fixo) = ` +
    `R$ ${impactoReais.toLocaleString("pt-BR")} de impacto extra no caixa, ` +
    `equivalente a ${impactoPercentual}% das entradas projetadas para os ` +
    `próximos 6 meses (R$ ${entradasProjetadas6Meses.toLocaleString("pt-BR")}).`;

  return {
    empreendimentoId: emp.id,
    empreendimentoNome: emp.nome,
    diasAtraso,
    impactoReais,
    impactoPercentual,
    entradasProjetadas6Meses,
    explicacaoCalculo,
  };
}
