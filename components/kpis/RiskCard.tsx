import type { RiscoEmpreendimento } from "@/lib/risk/ranking";
import RiskRing from "./RiskRing";
import { RISK_TOKENS, ringStrokeAtraso, ringStrokeEstouro } from "./riskTokens";

interface RiskCardProps {
  posicao: number;
  risco: RiscoEmpreendimento;
}

export default function RiskCard({ posicao, risco }: RiskCardProps) {
  const geral = RISK_TOKENS[risco.riscoGeral.classificacao];
  const atraso = RISK_TOKENS[risco.riscoAtraso.classificacao];
  const financeiro = RISK_TOKENS[risco.riscoFinanceiro.classificacao];

  const percentualAtrasado = risco.riscoAtraso.indicadores.percentualAtrasado;
  const percentualEstouro = risco.riscoFinanceiro.indicadores.percentualEstouroOrcamento;

  return (
    <div className="glass-card rounded-2xl relative overflow-hidden flex flex-col p-6 transition-transform hover:-translate-y-1 duration-300">
      <div className={`absolute left-0 top-0 bottom-0 w-2 ${geral.borderBg}`} />

      <div className="flex justify-between items-start mb-6">
        <div>
          <div className={`font-label-sm text-label-sm ${geral.badgeText} mb-1 tracking-widest font-bold`}>
            #{posicao}
          </div>
          <h3 className="font-headline-md text-headline-md text-on-surface font-bold">
            {risco.nome}
          </h3>
          <p className="font-body-md text-body-md text-on-surface-variant flex items-center gap-1 mt-1">
            <span className="material-symbols-outlined text-[16px]">location_on</span> {risco.cidade}
          </p>
        </div>
        <div
          className={`${geral.badgeBg} border ${geral.badgeBorder} ${geral.badgeText} px-4 py-2 rounded-full font-label-sm text-label-sm uppercase flex items-center gap-2 font-bold shadow-sm`}
        >
          <span className={`w-2.5 h-2.5 rounded-full ${geral.dotBg} ${risco.riscoGeral.classificacao === "alto" ? "animate-pulse" : ""}`} />
          {geral.label} · {risco.riscoGeral.score}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <RiskRing
          value={percentualAtrasado}
          strokeClass={ringStrokeAtraso(percentualAtrasado)}
          displayValue={`${percentualAtrasado}%`}
          label="Atraso Cronograma"
        />
        <RiskRing
          value={percentualEstouro}
          strokeClass={ringStrokeEstouro(percentualEstouro)}
          displayValue={`${percentualEstouro}%`}
          label="Estouro Orçamento"
        />
      </div>

      <div className="grid grid-cols-2 gap-6 pt-4 border-t border-outline-variant/30">
        <div>
          <p className="font-label-sm text-label-sm text-on-surface-variant uppercase">Risco de atraso</p>
          <p className={`font-label-sm text-label-sm ${atraso.badgeText} mt-1 font-bold capitalize`}>
            {risco.riscoAtraso.classificacao} · {risco.riscoAtraso.score}
          </p>
        </div>
        <div>
          <p className="font-label-sm text-label-sm text-on-surface-variant uppercase">Risco financeiro</p>
          <p className={`font-label-sm text-label-sm ${financeiro.badgeText} mt-1 font-bold capitalize`}>
            {risco.riscoFinanceiro.classificacao} · {risco.riscoFinanceiro.score}
          </p>
        </div>
      </div>
    </div>
  );
}
