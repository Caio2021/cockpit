import KpiPanel from "@/components/kpis/KpiPanel";
import ChatPanel from "@/components/chat/ChatPanel";

export default function Home() {
  return (
    <div className="flex flex-col lg:flex-row flex-1 min-h-0">
      <div className="lg:w-1/2 overflow-y-auto p-6 border-b lg:border-r lg:border-b-0 border-neutral-200 dark:border-neutral-800">
        <h1 className="text-xl font-semibold mb-1">
          Cockpit Inteligente de Gestão de Empreendimentos
        </h1>
        <p className="text-sm text-neutral-500 mb-4">
          Ranking de risco em tempo real dos empreendimentos monitorados.
        </p>
        <KpiPanel />
      </div>
      <div className="lg:w-1/2 flex flex-col min-h-[60vh] lg:min-h-0">
        <ChatPanel />
      </div>
    </div>
  );
}
