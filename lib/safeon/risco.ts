import { classificarScore, type Classificacao } from "@/components/safeon/riskTokens";
import { getAlertasAbertosPorCliente, getSaudeBasePorCliente } from "./queries";

export interface RiscoCliente {
  clienteId: number | null;
  nome: string;
  total: number;
  reportando: number;
  parcial: number;
  semPosicao: number;
  percentualSemPosicao: number;
  percentualReportando: number;
  alertasAbertos: number;
  score: number;
  classificacao: Classificacao;
  dataReferencia: string;
}

// Risco do cliente = 60% base sem posição + 40% alertas abertos.
// A base que não reporta é o problema estrutural (o cliente está cego sobre a
// própria frota); os alertas abertos são o problema imediato, e por isso pesam
// menos no ranking mas saturam rápido — 10 alertas em aberto já cravam 100.
function calcularScore(percentualSemPosicao: number, alertasAbertos: number): number {
  const riscoAlertas = Math.min(100, alertasAbertos * 10);
  return Math.round(percentualSemPosicao * 0.6 + riscoAlertas * 0.4);
}

export interface SaudeClientes {
  ranking: RiscoCliente[];
  // Objetos do snapshot sem clientId no cadastro. Não é um cliente — entra
  // separado para não competir no ranking (é o maior "cliente" da base
  // justamente por ser um balde de cadastro incompleto).
  semCliente: RiscoCliente | null;
}

function montar(
  c: Awaited<ReturnType<typeof getSaudeBasePorCliente>>[number],
  alertasAbertos: number,
): RiscoCliente {
  const percentualSemPosicao = c.total > 0 ? Math.round((c.semPosicao / c.total) * 100) : 0;
  const percentualReportando = c.total > 0 ? Math.round((c.reportando / c.total) * 100) : 0;
  const score = calcularScore(percentualSemPosicao, alertasAbertos);

  return {
    ...c,
    percentualSemPosicao,
    percentualReportando,
    alertasAbertos,
    score,
    classificacao: classificarScore(score),
  };
}

export async function getSaudeClientes(): Promise<SaudeClientes> {
  const [saude, alertas] = await Promise.all([
    getSaudeBasePorCliente(),
    getAlertasAbertosPorCliente(200),
  ]);

  const alertasPorCliente = new Map(alertas.map((a) => [a.clienteId, a.abertos]));
  const linhas = saude.map((c) => montar(c, alertasPorCliente.get(c.clienteId) ?? 0));

  return {
    ranking: linhas
      .filter((c) => c.clienteId !== null)
      .sort((a, b) => b.score - a.score || b.total - a.total),
    semCliente: linhas.find((c) => c.clienteId === null) ?? null,
  };
}

export async function getRankingClientes(): Promise<RiscoCliente[]> {
  return (await getSaudeClientes()).ranking;
}
