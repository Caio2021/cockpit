import KpiPanel from "@/components/kpis/KpiPanel";
import ChatPanel from "@/components/chat/ChatPanel";

export default function Home() {
  return (
    <>
      <div className="mb-8">
        <h2 className="font-headline-lg text-headline-lg text-on-surface mb-2">
          Cockpit Inteligente de Gestão de Empreendimentos
        </h2>
        <p className="font-body-lg text-body-lg text-on-surface-variant">
          Ranking de risco em tempo real dos empreendimentos monitorados.
        </p>
        <p className="font-body-md text-body-md text-on-surface-variant mt-1">
          Ranking geral de risco (60% peso em atraso de cronograma, 40% em risco financeiro) — 7
          empreendimentos monitorados.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        <div className="xl:col-span-8 flex flex-col gap-6">
          <KpiPanel />
        </div>

        <div className="xl:col-span-4 h-full">
          <div className="glass-card rounded-2xl border border-outline-variant shadow-lg h-[calc(100vh-180px)] sticky top-6 flex flex-col overflow-hidden">
            <ChatPanel />
          </div>
        </div>
      </div>
    </>
  );
}
