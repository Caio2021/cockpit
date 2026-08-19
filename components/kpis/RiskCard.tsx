import type { RiscoEmpreendimento } from "@/lib/risk/ranking";
import RiskMeter from "./RiskMeter";
import { STATUS } from "./riskColors";

interface RiskCardProps {
  posicao: number;
  risco: RiscoEmpreendimento;
}

export default function RiskCard({ posicao, risco }: RiskCardProps) {
  const corGeral = STATUS[risco.riscoGeral.classificacao];

  return (
    <div
      className="rounded-lg border border-l-4 bg-white dark:bg-neutral-900 dark:border-neutral-800 shadow-sm p-4 flex flex-col gap-3"
      style={{ borderLeftColor: corGeral.hex }}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs text-neutral-500">#{posicao}</p>
          <h3 className="font-semibold leading-tight">{risco.nome}</h3>
          <p className="text-xs text-neutral-500">{risco.cidade}</p>
        </div>
        <span
          className="shrink-0 text-xs font-medium px-2 py-1 rounded-full border text-neutral-900 dark:text-neutral-100"
          style={{ borderColor: corGeral.hex, backgroundColor: `${corGeral.hex}1a` }}
        >
          {corGeral.label} · {risco.riscoGeral.score}
        </span>
      </div>

      <div className="flex flex-col gap-2.5">
        <RiskMeter
          label="Risco de atraso"
          sublabel={`${risco.riscoAtraso.indicadores.percentualAtrasado}% do cronograma atrasado · ${risco.riscoAtraso.indicadores.atividadesCriticasAtrasadas} atividades críticas`}
          score={risco.riscoAtraso.score}
          classificacao={risco.riscoAtraso.classificacao}
        />
        <RiskMeter
          label="Risco financeiro"
          sublabel={`${risco.riscoFinanceiro.indicadores.percentualEstouroOrcamento}% de estouro de orçamento`}
          score={risco.riscoFinanceiro.score}
          classificacao={risco.riscoFinanceiro.classificacao}
        />
      </div>
    </div>
  );
}
