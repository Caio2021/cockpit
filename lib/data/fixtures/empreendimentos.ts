import type { Empreendimento } from "../types";

// Dados 100% fictícios para fins de demonstração (AC9 — nenhum dado real).
// Desenhados deliberadamente com variedade de risco: alguns claramente altos,
// alguns baixos, resto no meio, para gerar uma narrativa de demo clara.
export const empreendimentos: Empreendimento[] = [
  {
    id: "aurora",
    nome: "Residencial Aurora",
    cidade: "Belo Horizonte, MG",
    cronograma: {
      percentualConcluido: 42,
      percentualAtrasado: 27,
      atividadesCriticasAtrasadas: 6,
    },
    orcamento: { previsto: 18_000_000, realizado: 21_400_000 },
    fornecedoresCriticos: [
      {
        fornecedorId: "delta-estruturas",
        fornecedorNome: "Fornecedor Delta Estruturas",
        categoria: "Estrutura/Concretagem",
        diasAtrasoHistorico: 34,
        criticidade: "alta",
      },
      {
        fornecedorId: "vidro-sul",
        fornecedorNome: "Vidro Sul Esquadrias",
        categoria: "Esquadrias",
        diasAtrasoHistorico: 12,
        criticidade: "media",
      },
    ],
    contratos: [
      {
        fornecedorId: "delta-estruturas",
        dataProximoReajuste: "2026-09-15",
        indice: "INCC",
        percentualIndiceProjetado: 7.8,
      },
    ],
    fluxoCaixaProjetado: [
      { mes: "2026-09", entradas: 1_450_000, saidas: 1_900_000 },
      { mes: "2026-10", entradas: 1_500_000, saidas: 1_950_000 },
      { mes: "2026-11", entradas: 1_600_000, saidas: 2_000_000 },
      { mes: "2026-12", entradas: 1_700_000, saidas: 1_850_000 },
      { mes: "2027-01", entradas: 1_550_000, saidas: 1_800_000 },
      { mes: "2027-02", entradas: 1_600_000, saidas: 1_750_000 },
    ],
    custoFixoMensal: 380_000,
  },
  {
    id: "horizonte",
    nome: "Edifício Horizonte",
    cidade: "Curitiba, PR",
    cronograma: {
      percentualConcluido: 68,
      percentualAtrasado: 3,
      atividadesCriticasAtrasadas: 0,
    },
    orcamento: { previsto: 12_500_000, realizado: 12_100_000 },
    fornecedoresCriticos: [
      {
        fornecedorId: "aco-parana",
        fornecedorNome: "Aço Paraná Materiais",
        categoria: "Estrutura Metálica",
        diasAtrasoHistorico: 2,
        criticidade: "baixa",
      },
    ],
    contratos: [
      {
        fornecedorId: "aco-parana",
        dataProximoReajuste: "2027-04-01",
        indice: "IPCA",
        percentualIndiceProjetado: 4.1,
      },
    ],
    fluxoCaixaProjetado: [
      { mes: "2026-09", entradas: 1_100_000, saidas: 980_000 },
      { mes: "2026-10", entradas: 1_150_000, saidas: 1_000_000 },
      { mes: "2026-11", entradas: 1_100_000, saidas: 970_000 },
      { mes: "2026-12", entradas: 1_200_000, saidas: 1_010_000 },
      { mes: "2027-01", entradas: 1_150_000, saidas: 990_000 },
      { mes: "2027-02", entradas: 1_100_000, saidas: 960_000 },
    ],
    custoFixoMensal: 210_000,
  },
  {
    id: "vila-verde",
    nome: "Condomínio Vila Verde",
    cidade: "Ribeirão Preto, SP",
    cronograma: {
      percentualConcluido: 55,
      percentualAtrasado: 12,
      atividadesCriticasAtrasadas: 2,
    },
    orcamento: { previsto: 9_800_000, realizado: 10_300_000 },
    fornecedoresCriticos: [
      {
        fornecedorId: "hidraulica-sp",
        fornecedorNome: "Hidráulica SP Instalações",
        categoria: "Instalações Hidráulicas",
        diasAtrasoHistorico: 18,
        criticidade: "media",
      },
    ],
    contratos: [
      {
        fornecedorId: "hidraulica-sp",
        dataProximoReajuste: "2026-10-20",
        indice: "IPCA",
        percentualIndiceProjetado: 5.2,
      },
    ],
    fluxoCaixaProjetado: [
      { mes: "2026-09", entradas: 820_000, saidas: 860_000 },
      { mes: "2026-10", entradas: 850_000, saidas: 880_000 },
      { mes: "2026-11", entradas: 900_000, saidas: 870_000 },
      { mes: "2026-12", entradas: 870_000, saidas: 850_000 },
      { mes: "2027-01", entradas: 900_000, saidas: 840_000 },
      { mes: "2027-02", entradas: 880_000, saidas: 830_000 },
    ],
    custoFixoMensal: 165_000,
  },
  {
    id: "bosque-palmeiras",
    nome: "Residencial Bosque das Palmeiras",
    cidade: "Goiânia, GO",
    cronograma: {
      percentualConcluido: 61,
      percentualAtrasado: 8,
      atividadesCriticasAtrasadas: 1,
    },
    orcamento: { previsto: 15_200_000, realizado: 18_900_000 },
    fornecedoresCriticos: [
      {
        fornecedorId: "cimento-centro-oeste",
        fornecedorNome: "Cimento Centro-Oeste",
        categoria: "Insumos/Concreto",
        diasAtrasoHistorico: 9,
        criticidade: "media",
      },
    ],
    contratos: [
      {
        fornecedorId: "cimento-centro-oeste",
        dataProximoReajuste: "2026-08-30",
        indice: "INCC",
        percentualIndiceProjetado: 9.4,
      },
    ],
    fluxoCaixaProjetado: [
      { mes: "2026-09", entradas: 1_050_000, saidas: 1_400_000 },
      { mes: "2026-10", entradas: 1_100_000, saidas: 1_450_000 },
      { mes: "2026-11", entradas: 1_150_000, saidas: 1_500_000 },
      { mes: "2026-12", entradas: 1_200_000, saidas: 1_380_000 },
      { mes: "2027-01", entradas: 1_100_000, saidas: 1_350_000 },
      { mes: "2027-02", entradas: 1_150_000, saidas: 1_320_000 },
    ],
    custoFixoMensal: 290_000,
  },
  {
    id: "alameda",
    nome: "Torres Alameda",
    cidade: "Porto Alegre, RS",
    cronograma: {
      percentualConcluido: 33,
      percentualAtrasado: 6,
      atividadesCriticasAtrasadas: 1,
    },
    orcamento: { previsto: 21_000_000, realizado: 21_500_000 },
    fornecedoresCriticos: [
      {
        fornecedorId: "elevadores-sul",
        fornecedorNome: "Elevadores Sul Ltda",
        categoria: "Elevadores",
        diasAtrasoHistorico: 5,
        criticidade: "baixa",
      },
    ],
    contratos: [
      {
        fornecedorId: "elevadores-sul",
        dataProximoReajuste: "2027-03-10",
        indice: "IPCA",
        percentualIndiceProjetado: 4.6,
      },
    ],
    fluxoCaixaProjetado: [
      { mes: "2026-09", entradas: 1_800_000, saidas: 1_750_000 },
      { mes: "2026-10", entradas: 1_850_000, saidas: 1_800_000 },
      { mes: "2026-11", entradas: 1_900_000, saidas: 1_820_000 },
      { mes: "2026-12", entradas: 1_950_000, saidas: 1_870_000 },
      { mes: "2027-01", entradas: 1_900_000, saidas: 1_840_000 },
      { mes: "2027-02", entradas: 1_950_000, saidas: 1_860_000 },
    ],
    custoFixoMensal: 340_000,
  },
  {
    id: "parque-aguas",
    nome: "Parque das Águas",
    cidade: "Campinas, SP",
    cronograma: {
      percentualConcluido: 48,
      percentualAtrasado: 21,
      atividadesCriticasAtrasadas: 4,
    },
    orcamento: { previsto: 13_400_000, realizado: 14_100_000 },
    fornecedoresCriticos: [
      {
        fornecedorId: "terraplenagem-campinas",
        fornecedorNome: "Terraplenagem Campinas",
        categoria: "Terraplenagem",
        diasAtrasoHistorico: 41,
        criticidade: "alta",
      },
      {
        fornecedorId: "eletrica-vale",
        fornecedorNome: "Elétrica Vale Instalações",
        categoria: "Instalações Elétricas",
        diasAtrasoHistorico: 15,
        criticidade: "media",
      },
    ],
    contratos: [
      {
        fornecedorId: "terraplenagem-campinas",
        dataProximoReajuste: "2026-09-05",
        indice: "INCC",
        percentualIndiceProjetado: 6.9,
      },
    ],
    fluxoCaixaProjetado: [
      { mes: "2026-09", entradas: 980_000, saidas: 1_150_000 },
      { mes: "2026-10", entradas: 1_020_000, saidas: 1_200_000 },
      { mes: "2026-11", entradas: 1_050_000, saidas: 1_220_000 },
      { mes: "2026-12", entradas: 1_100_000, saidas: 1_180_000 },
      { mes: "2027-01", entradas: 1_050_000, saidas: 1_150_000 },
      { mes: "2027-02", entradas: 1_080_000, saidas: 1_120_000 },
    ],
    custoFixoMensal: 250_000,
  },
  {
    id: "zenith",
    nome: "Edifício Zenith",
    cidade: "Florianópolis, SC",
    cronograma: {
      percentualConcluido: 74,
      percentualAtrasado: 1,
      atividadesCriticasAtrasadas: 0,
    },
    orcamento: { previsto: 16_800_000, realizado: 16_500_000 },
    fornecedoresCriticos: [
      {
        fornecedorId: "acabamentos-ilha",
        fornecedorNome: "Acabamentos Ilha",
        categoria: "Acabamentos",
        diasAtrasoHistorico: 0,
        criticidade: "baixa",
      },
    ],
    contratos: [
      {
        fornecedorId: "acabamentos-ilha",
        dataProximoReajuste: "2027-05-20",
        indice: "IPCA",
        percentualIndiceProjetado: 3.9,
      },
    ],
    fluxoCaixaProjetado: [
      { mes: "2026-09", entradas: 1_600_000, saidas: 1_400_000 },
      { mes: "2026-10", entradas: 1_650_000, saidas: 1_420_000 },
      { mes: "2026-11", entradas: 1_700_000, saidas: 1_450_000 },
      { mes: "2026-12", entradas: 1_750_000, saidas: 1_480_000 },
      { mes: "2027-01", entradas: 1_700_000, saidas: 1_440_000 },
      { mes: "2027-02", entradas: 1_680_000, saidas: 1_410_000 },
    ],
    custoFixoMensal: 300_000,
  },
];
