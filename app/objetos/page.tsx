import PageHeader from "@/components/ui/PageHeader";
import StatTile from "@/components/ui/StatTile";
import Panel from "@/components/ui/Panel";
import { getResumoObjetos } from "@/lib/safeon/queries";
import { getSaudeClientes } from "@/lib/safeon/risco";

export const dynamic = "force-dynamic";

export default async function Objetos() {
  const [resumo, saude] = await Promise.all([getResumoObjetos(), getSaudeClientes()]);

  // Aqui a visão é por objeto, não por cliente: o balde "Sem cliente" conta
  // junto, porque são veículos reais do snapshot sem cadastro vinculado.
  const linhas = [...saude.ranking, ...(saude.semCliente ? [saude.semCliente] : [])].sort(
    (a, b) => b.semPosicao - a.semPosicao,
  );

  const semPosicao = linhas.reduce((s, c) => s + c.semPosicao, 0);
  const reportando = linhas.reduce((s, c) => s + c.reportando, 0);
  const monitorados = linhas.reduce((s, c) => s + c.total, 0);
  const maiorSemPosicao = Math.max(1, ...linhas.map((c) => c.semPosicao));

  return (
    <>
      <PageHeader
        titulo="Objetos Rastreáveis"
        subtitulo="Cadastro de veículos e equipamentos e sua cobertura de rastreamento"
        aba="Frota"
      />

      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        <StatTile
          destaque
          label="Objetos cadastrados"
          valor={resumo.total.toLocaleString("pt-BR")}
          rodape={`${resumo.ativos.toLocaleString("pt-BR")} ativos`}
          icone="directions_car"
        />
        <StatTile
          label="Sem dispositivo"
          valor={resumo.semDispositivo.toLocaleString("pt-BR")}
          rodape="Nenhum rastreador vinculado"
          icone="link_off"
        />
        <StatTile
          label="Sem posição na janela"
          valor={semPosicao.toLocaleString("pt-BR")}
          rodape={`de ${monitorados.toLocaleString("pt-BR")} no último snapshot`}
          icone="location_off"
        />
        <StatTile
          label="Reportando"
          valor={reportando.toLocaleString("pt-BR")}
          rodape="Com posição recente"
          icone="my_location"
        />
      </section>

      <Panel
        titulo="Objetos sem posição por cliente"
        subtitulo="Onde está concentrada a frota que parou de reportar"
      >
        <div className="flex flex-col gap-4">
          {linhas.slice(0, 15).map((c) => (
            <div key={`${c.clienteId}-${c.nome}`}>
              <div className="flex items-baseline justify-between mb-2">
                <span className="font-body-md text-body-md text-on-surface truncate">{c.nome}</span>
                <span className="font-body-md text-body-md text-on-surface-variant shrink-0 ml-3">
                  <span className="text-on-surface font-semibold">
                    {c.semPosicao.toLocaleString("pt-BR")}
                  </span>{" "}
                  / {c.total.toLocaleString("pt-BR")}
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-surface-variant overflow-hidden">
                <div
                  className="h-full rounded-full bg-error"
                  style={{ width: `${(c.semPosicao / maiorSemPosicao) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </>
  );
}
