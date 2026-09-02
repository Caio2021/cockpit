import type Anthropic from "@anthropic-ai/sdk";
import type Groq from "groq-sdk";

export const TOOLS: Anthropic.Tool[] = [
  {
    name: "getResumoOperacao",
    description:
      "Retorna a visão consolidada da operação: total de objetos rastreáveis (ativos, sem dispositivo), alertas por situação (total, novos, em tratamento, finalizados) e ordens de trabalho (abertas, fechadas nos últimos 30 dias, idade da mais antiga). Use para perguntas gerais de 'como está a operação', 'quantos alertas em aberto', 'quantas ordens abertas'.",
    input_schema: { type: "object", properties: {}, additionalProperties: false },
  },
  {
    name: "getRankingClientesRisco",
    description:
      "Retorna o ranking de clientes por risco (score 0-100, classificação alto/médio/baixo), com total de objetos monitorados, quantos estão sem posição na janela, quantos reportam normalmente e quantos alertas em aberto o cliente tem. O score combina 60% de base sem posição e 40% de alertas em aberto. Use para 'qual cliente está em maior risco', 'quais clientes estão com a base parada', ou ranking geral.",
    input_schema: { type: "object", properties: {}, additionalProperties: false },
  },
  {
    name: "getAlertasPorDia",
    description:
      "Retorna a contagem de violações de alerta por dia numa janela recente. Use para 'quantos alertas por dia', 'em que dia houve mais alertas', 'tendência de alertas'.",
    input_schema: {
      type: "object",
      properties: {
        dias: { type: "integer", description: "Janela em dias. Padrão: 7." },
      },
      required: [],
      additionalProperties: false,
    },
  },
  {
    name: "getOrdensAbertas",
    description:
      "Retorna uma AMOSTRA das ordens de trabalho em aberto: as mais antigas primeiro, com cliente, placa, tipo, status e há quantos dias estão abertas, mais o campo totalAbertas com o total real. Use para 'quais ordens estão paradas há mais tempo' ou 'gargalos de recuperação'. O tamanho da lista é o limite da consulta, NUNCA o total — para contar ordens use totalAbertas ou getResumoOperacao.",
    input_schema: {
      type: "object",
      properties: {
        limite: { type: "integer", description: "Quantas ordens retornar. Padrão: 20." },
      },
      required: [],
      additionalProperties: false,
    },
  },
  {
    name: "buscarNaBase",
    description:
      "Busca objetos rastreáveis por placa ou chassi, clientes por nome/documento e ordens de trabalho por número ou placa. Use quando o usuário citar uma placa, um nome de cliente ou um número de OT específico.",
    input_schema: {
      type: "object",
      properties: {
        termo: {
          type: "string",
          description: "Placa, chassi, nome do cliente, documento ou número da ordem de trabalho.",
        },
      },
      required: ["termo"],
      additionalProperties: false,
    },
  },
  {
    name: "listarTabelas",
    description:
      "Lista todas as tabelas do banco do SafeOn com a estimativa de linhas de cada uma. Use como primeiro passo sempre que a pergunta sair do que as outras ferramentas cobrem (contratos, dispositivos, prestadores, financeiro, cercas, radar, locação, processos judiciais, usuários, etc.) — assim você descobre onde o dado mora antes de escrever SQL.",
    input_schema: { type: "object", properties: {}, additionalProperties: false },
  },
  {
    name: "descreverTabela",
    description:
      "Retorna as colunas, tipos e nulidade de uma tabela do SafeOn. Use SEMPRE antes de escrever uma consulta em consultarBase: nomes de tabela e coluna são camelCase entre aspas e não podem ser adivinhados.",
    input_schema: {
      type: "object",
      properties: {
        tabela: { type: "string", description: "Nome exato da tabela, como veio de listarTabelas." },
      },
      required: ["tabela"],
      additionalProperties: false,
    },
  },
  {
    name: "consultarBase",
    description:
      "Executa uma consulta SELECT somente leitura no banco do SafeOn e devolve as linhas. É a ferramenta de uso geral: qualquer pergunta sobre dados do projeto que as ferramentas específicas não respondam deve ser resolvida aqui. Regras: só SELECT ou WITH, uma única instrução, sem ponto e vírgula no meio; identificadores camelCase precisam de aspas duplas (ex.: \"trackableObjects\".\"customerId\"); um LIMIT é aplicado automaticamente se você não informar. Prefira agregar no SQL (count, sum, group by) a trazer linhas cruas.",
    input_schema: {
      type: "object",
      properties: {
        sql: { type: "string", description: "A consulta SELECT a executar." },
        limite: {
          type: "integer",
          description: "Máximo de linhas (padrão 100, teto 500).",
        },
      },
      required: ["sql"],
      additionalProperties: false,
    },
  },
];

// A API da Groq usa o formato de function calling da OpenAI; mesmo contrato,
// envelope diferente.
export const GROQ_TOOLS: Groq.Chat.Completions.ChatCompletionTool[] = TOOLS.map((t) => ({
  type: "function",
  function: {
    name: t.name,
    description: t.description ?? "",
    parameters: t.input_schema as Record<string, unknown>,
  },
}));
