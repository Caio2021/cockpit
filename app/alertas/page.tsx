import PageHeader from "@/components/ui/PageHeader";
import StatTile from "@/components/ui/StatTile";
import Panel from "@/components/ui/Panel";
import AlertasChart from "@/components/safeon/AlertasChart";
import {
  getAlertasAbertosPorCliente,
  getAlertasPorDia,
  getResumoAlertas,
} from "@/lib/safeon/queries";

export const dynamic = "force-dynamic";

export default async function Alertas() {
  const [resumo, porDia, porCliente] = await Promise.all([
    getResumoAlertas(),
    getAlertasPorDia(7),
    getAlertasAbertosPorCliente(10),
  ]);

  const maiorAberto = Math.max(1, ...porCliente.map((c) => c.abertos));

  return (
    <>
      <PageHeader
        titulo="Análise de Alertas"
        subtitulo="Indicadores de violações de regras de alerta"
        aba="Alertas"
      />

      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        <StatTile
          destaque
          label="Total de alertas"
          valor={resumo.total.toLocaleString("pt-BR")}
          rodape="Todos os períodos"
          icone="warning"
        />
        <StatTile label="Novos" valor={resumo.novos} rodape="Aguardando triagem" icone="monitor_heart" />
        <StatTile
          label="Em tratamento"
          valor={resumo.emTratamento}
          rodape="Com responsável"
          icone="trending_down"
        />
        <StatTile
          label="Finalizados"
          valor={resumo.finalizados.toLocaleString("pt-BR")}
          rodape="Encerrados ou expirados"
          icone="check_circle"
        />
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
        <Panel titulo="Alertas por dia" subtitulo="Últimos 7 dias">
          <AlertasChart dados={porDia} />
        </Panel>

        <Panel titulo="Alertas em aberto por cliente" subtitulo="Status Novo, Em Andamento e Real">
          {porCliente.length === 0 ? (
            <p className="font-body-md text-body-md text-on-surface-variant">
              Nenhum alerta em aberto no momento.
            </p>
          ) : (
            <div className="flex flex-col gap-4">
              {porCliente.map((c) => (
                <div key={`${c.clienteId}-${c.nome}`}>
                  <div className="flex items-baseline justify-between mb-2">
                    <span className="font-body-md text-body-md text-on-surface truncate">{c.nome}</span>
                    <span className="font-body-md text-body-md text-on-surface font-semibold shrink-0 ml-3">
                      {c.abertos}
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-surface-variant overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary-container"
                      style={{ width: `${(c.abertos / maiorAberto) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>
    </>
  );
}
