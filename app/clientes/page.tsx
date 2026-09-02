import PageHeader from "@/components/ui/PageHeader";
import StatTile from "@/components/ui/StatTile";
import ClienteRiscoCard from "@/components/safeon/ClienteRiscoCard";
import { getSaudeClientes } from "@/lib/safeon/risco";

export const dynamic = "force-dynamic";

export default async function Clientes() {
  const { ranking, semCliente } = await getSaudeClientes();
  const totalObjetos = ranking.reduce((s, c) => s + c.total, 0);
  const contar = (c: "alto" | "medio" | "baixo") =>
    ranking.filter((r) => r.classificacao === c).length;
  const referencia = ranking[0]?.dataReferencia;

  return (
    <>
      <PageHeader
        titulo="Saúde da Base"
        subtitulo="Reconciliação entre a última posição do rastreamento e o cadastro, por cliente"
        aba="Clientes"
      />

      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        <StatTile
          destaque
          label="Clientes na base"
          valor={ranking.length}
          rodape={
            referencia
              ? `snapshot de ${new Date(`${referencia}T12:00:00Z`).toLocaleDateString("pt-BR")}`
              : "sem snapshot"
          }
          icone="groups"
        />
        <StatTile label="Risco alto" valor={contar("alto")} rodape="Ação imediata" icone="crisis_alert" />
        <StatTile label="Risco médio" valor={contar("medio")} rodape="Em atenção" icone="trending_up" />
        <StatTile
          label="Objetos sem cliente"
          valor={(semCliente?.total ?? 0).toLocaleString("pt-BR")}
          rodape={`de ${(totalObjetos + (semCliente?.total ?? 0)).toLocaleString("pt-BR")} no snapshot`}
          icone="help"
        />
      </section>

      <section aria-label="Ranking de risco por cliente">
        <div className="flex items-end justify-between gap-4 mb-5">
          <div>
            <h2 className="font-headline-md text-headline-md text-on-surface">
              Ranking de risco por cliente
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">
              60% base sem posição na janela · 40% alertas em aberto
            </p>
          </div>
          <span className="font-body-md text-body-md text-on-surface-variant hidden sm:block">
            {ranking.length} clientes
          </span>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          {ranking.map((cliente, i) => (
            <ClienteRiscoCard
              key={`${cliente.clienteId}-${cliente.nome}`}
              posicao={i + 1}
              cliente={cliente}
            />
          ))}
        </div>
      </section>

    </>
  );
}
