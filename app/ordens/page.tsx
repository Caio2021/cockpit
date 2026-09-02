import PageHeader from "@/components/ui/PageHeader";
import StatTile from "@/components/ui/StatTile";
import Panel from "@/components/ui/Panel";
import { getOrdensAbertas, getResumoOrdens } from "@/lib/safeon/queries";

export const dynamic = "force-dynamic";

// Faixas de envelhecimento da OT: 90 dias é o corte em que a recuperação
// praticamente não avança mais sem uma ação nova; 30 dias já é atenção.
function corDias(dias: number): string {
  if (dias >= 90) return "text-error";
  if (dias >= 30) return "text-primary-container";
  return "text-on-surface";
}

export default async function Ordens() {
  const [resumo, ordens] = await Promise.all([getResumoOrdens(), getOrdensAbertas(50)]);
  const criticas = ordens.filter((o) => o.diasAberta >= 90).length;

  return (
    <>
      <PageHeader
        titulo="Ordens de Trabalho"
        subtitulo="Ordens em aberto por tempo de permanência"
        aba="Recuperação"
      />

      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        <StatTile
          destaque
          label="Ordens abertas"
          valor={resumo.abertas.toLocaleString("pt-BR")}
          rodape="Status não final"
          icone="assignment"
        />
        <StatTile
          label="Mais antiga"
          valor={`${resumo.maisAntigaDias}d`}
          rodape="Desde a data do evento"
          icone="hourglass_top"
        />
        <StatTile
          label="Acima de 90 dias"
          valor={criticas}
          rodape="Entre as 50 mais antigas"
          icone="priority_high"
        />
        <StatTile
          label="Fechadas em 30 dias"
          valor={resumo.fechadas30d}
          rodape="Concluídas no período"
          icone="check_circle"
        />
      </section>

      <Panel titulo="Ordens mais antigas em aberto" subtitulo="As 50 com maior tempo desde o evento">
        <div className="overflow-x-auto">
          <table className="w-full font-body-md text-body-md">
            <thead>
              <tr className="text-left text-on-surface-variant border-b border-outline-variant">
                <th className="font-label-sm text-label-sm font-medium pb-3 pr-4">OT</th>
                <th className="font-label-sm text-label-sm font-medium pb-3 pr-4">Cliente</th>
                <th className="font-label-sm text-label-sm font-medium pb-3 pr-4">Placa</th>
                <th className="font-label-sm text-label-sm font-medium pb-3 pr-4">Tipo</th>
                <th className="font-label-sm text-label-sm font-medium pb-3 pr-4">Status</th>
                <th className="font-label-sm text-label-sm font-medium pb-3 text-right">Em aberto</th>
              </tr>
            </thead>
            <tbody>
              {ordens.map((o) => (
                <tr key={o.id} className="border-b border-outline-variant last:border-0">
                  <td className="py-3 pr-4 text-on-surface font-medium whitespace-nowrap">#{o.id}</td>
                  <td className="py-3 pr-4 text-on-surface-variant">{o.cliente ?? "—"}</td>
                  <td className="py-3 pr-4 text-on-surface whitespace-nowrap">{o.placa ?? "—"}</td>
                  <td className="py-3 pr-4 text-on-surface-variant whitespace-nowrap">{o.tipo}</td>
                  <td className="py-3 pr-4 whitespace-nowrap">
                    <span className="bg-surface-variant text-on-surface-variant rounded-full px-2.5 py-1 font-label-sm text-label-sm">
                      {o.status}
                    </span>
                  </td>
                  <td className={`py-3 text-right font-semibold whitespace-nowrap ${corDias(o.diasAberta)}`}>
                    {o.diasAberta} dias
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  );
}
