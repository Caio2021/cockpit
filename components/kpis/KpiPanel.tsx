import { getRankingRisco } from "@/lib/risk/ranking";
import RiskBarChart from "./RiskBarChart";
import RiskCard from "./RiskCard";

export default function KpiPanel() {
  const ranking = getRankingRisco();

  return (
    <section aria-label="Ranking de risco dos empreendimentos" className="flex flex-col gap-1">
      <p className="text-sm text-neutral-500 mb-3">
        Ranking geral de risco (60% peso em atraso de cronograma, 40% em risco
        financeiro) — {ranking.length} empreendimentos monitorados.
      </p>

      <RiskBarChart ranking={ranking} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {ranking.map((risco, i) => (
          <RiskCard key={risco.id} posicao={i + 1} risco={risco} />
        ))}
      </div>
    </section>
  );
}
