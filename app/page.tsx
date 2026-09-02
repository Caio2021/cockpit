import PageHeader from "@/components/ui/PageHeader";
import StatTile from "@/components/ui/StatTile";
import Panel from "@/components/ui/Panel";
import AlertasChart from "@/components/safeon/AlertasChart";
import ClienteRiscoCard from "@/components/safeon/ClienteRiscoCard";
import ChatPanel from "@/components/chat/ChatPanel";
import { getRankingClientes } from "@/lib/safeon/risco";
import {
  getAlertasPorDia,
  getResumoAlertas,
  getResumoObjetos,
  getResumoOrdens,
} from "@/lib/safeon/queries";

export const dynamic = "force-dynamic";

export default async function Painel() {
  const [objetos, alertas, ordens, porDia, ranking] = await Promise.all([
    getResumoObjetos(),
    getResumoAlertas(),
    getResumoOrdens(),
    getAlertasPorDia(7),
    getRankingClientes(),
  ]);

  const criticos = ranking.filter((c) => c.classificacao === "alto").length;

  return (
    <>
      <PageHeader
        titulo="Painel"
        subtitulo="Visão consolidada da operação — rastreamento, alertas e recuperação"
        aba="Visão geral"
      />

      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        <StatTile
          destaque
          label="Objetos rastreáveis"
          valor={objetos.total.toLocaleString("pt-BR")}
          rodape={`${objetos.ativos.toLocaleString("pt-BR")} ativos`}
          icone="directions_car"
        />
        <StatTile
          label="Alertas em aberto"
          valor={alertas.novos + alertas.emTratamento}
          rodape={`${alertas.novos} aguardando triagem`}
          icone="crisis_alert"
        />
        <StatTile
          label="Ordens abertas"
          valor={ordens.abertas.toLocaleString("pt-BR")}
          rodape={`mais antiga há ${ordens.maisAntigaDias} dias`}
          icone="assignment"
        />
        <StatTile
          label="Clientes em risco alto"
          valor={criticos}
          rodape={`de ${ranking.length} clientes na base`}
          icone="warning"
        />
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        <div className="xl:col-span-8 flex flex-col gap-6">
          <Panel
            titulo="Alertas por dia"
            subtitulo="Violações registradas nos últimos 7 dias"
            acao={
              <span className="font-body-md text-body-md text-on-surface-variant">
                {alertas.total.toLocaleString("pt-BR")} no total
              </span>
            }
          >
            <AlertasChart dados={porDia} />
          </Panel>

          <Panel
            titulo="Clientes em maior risco"
            subtitulo="60% base sem posição · 40% alertas em aberto"
          >
            <div className="grid grid-cols-1 2xl:grid-cols-2 gap-5">
              {ranking.slice(0, 4).map((cliente, i) => (
                <ClienteRiscoCard key={cliente.nome} posicao={i + 1} cliente={cliente} />
              ))}
            </div>
          </Panel>
        </div>

        <div className="xl:col-span-4 xl:sticky xl:top-0">
          {/* Altura menor que a viewport para o card inteiro — cabeçalho e campo
              de pergunta inclusive — caber na tela sem depender de rolagem. */}
          <div className="card rounded-xl h-[calc(100vh-10rem)] flex flex-col overflow-hidden">
            <ChatPanel />
          </div>
        </div>
      </div>
    </>
  );
}
