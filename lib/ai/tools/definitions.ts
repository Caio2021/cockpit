import type Anthropic from "@anthropic-ai/sdk";
import type Groq from "groq-sdk";

export const TOOLS: Anthropic.Tool[] = [
  {
    name: "getRiskRanking",
    description:
      "Retorna o ranking completo de empreendimentos por risco geral (combinação de risco de atraso e risco financeiro), com scores 0-100, classificação alto/médio/baixo e indicadores detalhados por empreendimento. Use para perguntas sobre 'qual empreendimento tem maior risco', ranking geral, ou visão consolidada de todos os empreendimentos.",
    input_schema: { type: "object", properties: {}, additionalProperties: false },
  },
  {
    name: "getRiskFinanceiroRanking",
    description:
      "Retorna o ranking de empreendimentos ordenado especificamente por risco financeiro (estouro de orçamento + exposição a reajuste de contratos), separado do risco de atraso de cronograma. Use para 'qual empreendimento possui maior risco financeiro' ou 'quais empreendimentos terão estouro de orçamento'.",
    input_schema: { type: "object", properties: {}, additionalProperties: false },
  },
  {
    name: "getEmpreendimentoDetalhe",
    description:
      "Retorna todos os dados brutos e indicadores usados no cálculo de risco de um empreendimento específico: cronograma, orçamento, fornecedores críticos, contratos e fluxo de caixa projetado. Use para 'explique o motivo' ou 'quais indicadores sustentam essa conclusão' sobre um empreendimento já identificado na conversa.",
    input_schema: {
      type: "object",
      properties: {
        identificador: {
          type: "string",
          description:
            "Nome (ou parte do nome) do empreendimento, ou o id retornado por uma chamada anterior a getRiskRanking/getRiskFinanceiroRanking.",
        },
      },
      required: ["identificador"],
      additionalProperties: false,
    },
  },
  {
    name: "getFornecedoresProblematicos",
    description:
      "Retorna fornecedores críticos ordenados por dias de atraso histórico (do mais crítico ao menos crítico), opcionalmente filtrados por um empreendimento específico. Use para 'quais fornecedores estão impactando os cronogramas'.",
    input_schema: {
      type: "object",
      properties: {
        identificador: {
          type: "string",
          description:
            "Opcional. Nome ou id de um empreendimento para filtrar os fornecedores. Se omitido, retorna fornecedores de todos os empreendimentos.",
        },
      },
      required: [],
      additionalProperties: false,
    },
  },
  {
    name: "getContratosParaReajuste",
    description:
      "Retorna contratos com data de próximo reajuste dentro de uma janela de dias a partir de hoje (padrão 120 dias), ordenados pelo mais próximo. Use para 'quais contratos precisam de reajuste'.",
    input_schema: {
      type: "object",
      properties: {
        janelaDias: {
          type: "integer",
          description: "Opcional. Janela em dias a partir de hoje. Padrão: 120.",
        },
      },
      required: [],
      additionalProperties: false,
    },
  },
  {
    name: "simularAtrasoNoCaixa",
    description:
      "Simula o impacto financeiro de um atraso de N dias no fluxo de caixa de um empreendimento específico. Cálculo determinístico — a mesma entrada sempre produz o mesmo resultado. Use quando o usuário pedir para simular um atraso (ex: 'simule um atraso de 30 dias') ou perguntar o impacto de X dias no caixa.",
    input_schema: {
      type: "object",
      properties: {
        identificador: {
          type: "string",
          description: "Nome ou id do empreendimento a simular.",
        },
        diasAtraso: {
          type: "integer",
          description: "Número de dias de atraso a simular (ex: 30, 60).",
        },
      },
      required: ["identificador", "diasAtraso"],
      additionalProperties: false,
    },
  },
];

// Mesmos schemas de TOOLS, convertidos para o formato de tool da API
// Groq/OpenAI-compatible (usado só no fallback — ver lib/ai/orchestrator.ts).
// Uma única fonte de verdade para nome/descrição/schema; nunca duplicar.
export const GROQ_TOOLS: Groq.Chat.Completions.ChatCompletionTool[] = TOOLS.map(
  (tool) => ({
    type: "function",
    function: {
      name: tool.name,
      description: tool.description,
      parameters: tool.input_schema as Record<string, unknown>,
    },
  }),
);
