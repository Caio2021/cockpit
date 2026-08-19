import { getRankingRisco } from "@/lib/risk/ranking";
import RiskCard from "./RiskCard";

export default function KpiPanel() {
  const ranking = getRankingRisco();

  return (
    <section aria-label="Ranking de risco dos empreendimentos" className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {ranking.map((risco, i) => (
        <RiskCard key={risco.id} posicao={i + 1} risco={risco} />
      ))}
    </section>
  );
}
