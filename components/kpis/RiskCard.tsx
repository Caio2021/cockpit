import type { RiscoEmpreendimento } from "@/lib/risk/ranking";
import type { Classificacao } from "@/lib/risk/util";

const ESTILO_CLASSIFICACAO: Record<
  Classificacao,
  { badge: string; borda: string; label: string }
> = {
  alto: {
    badge: "bg-red-100 text-red-800 border-red-300",
    borda: "border-l-red-500",
    label: "Risco alto",
  },
  medio: {
    badge: "bg-amber-100 text-amber-800 border-amber-300",
    borda: "border-l-amber-500",
    label: "Risco médio",
  },
  baixo: {
    badge: "bg-emerald-100 text-emerald-800 border-emerald-300",
    borda: "border-l-emerald-500",
    label: "Risco baixo",
  },
};

interface RiskCardProps {
  posicao: number;
  risco: RiscoEmpreendimento;
}

export default function RiskCard({ posicao, risco }: RiskCardProps) {
  const estilo = ESTILO_CLASSIFICACAO[risco.riscoGeral.classificacao];

  return (
    <div
      className={`rounded-lg border border-l-4 ${estilo.borda} bg-white dark:bg-neutral-900 dark:border-neutral-800 shadow-sm p-4 flex flex-col gap-2`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs text-neutral-500">#{posicao}</p>
          <h3 className="font-semibold leading-tight">{risco.nome}</h3>
          <p className="text-xs text-neutral-500">{risco.cidade}</p>
        </div>
        <span
          className={`shrink-0 text-xs font-medium px-2 py-1 rounded-full border ${estilo.badge}`}
        >
          {estilo.label} · {risco.riscoGeral.score}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs mt-1">
        <div>
          <p className="text-neutral-500">Atraso no cronograma</p>
          <p className="font-medium">
            {risco.riscoAtraso.indicadores.percentualAtrasado}%
          </p>
        </div>
        <div>
          <p className="text-neutral-500">Estouro de orçamento</p>
          <p className="font-medium">
            {risco.riscoFinanceiro.indicadores.percentualEstouroOrcamento}%
          </p>
        </div>
        <div>
          <p className="text-neutral-500">Risco de atraso</p>
          <p className="font-medium capitalize">
            {risco.riscoAtraso.classificacao} · {risco.riscoAtraso.score}
          </p>
        </div>
        <div>
          <p className="text-neutral-500">Risco financeiro</p>
          <p className="font-medium capitalize">
            {risco.riscoFinanceiro.classificacao} · {risco.riscoFinanceiro.score}
          </p>
        </div>
      </div>
    </div>
  );
}
