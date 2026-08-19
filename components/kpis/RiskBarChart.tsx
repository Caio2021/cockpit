import type { RiscoEmpreendimento } from "@/lib/risk/ranking";
import { STATUS } from "./riskColors";

interface RiskBarChartProps {
  ranking: RiscoEmpreendimento[];
}

// Visão geral do ranking (magnitude): uma barra por empreendimento, cor por
// status (nunca cor sozinha — rótulo com score + classificação na ponta),
// barras ≤24px, cantos arredondados só na ponta (base reta no eixo),
// trilha de fundo mostra a escala 0-100 implícita.
export default function RiskBarChart({ ranking }: RiskBarChartProps) {
  return (
    <div className="mb-5">
      <div className="flex items-center gap-4 text-xs text-neutral-500 mb-2">
        <span>Ranking geral de risco (0-100)</span>
        <span className="flex items-center gap-3 ml-auto">
          {(["baixo", "medio", "alto"] as const).map((c) => (
            <span key={c} className="flex items-center gap-1">
              <span
                className="inline-block w-2 h-2 rounded-full"
                style={{ backgroundColor: STATUS[c].hex }}
              />
              {STATUS[c].label.replace("Risco ", "")}
            </span>
          ))}
        </span>
      </div>

      <div className="flex flex-col gap-1.5">
        {ranking.map((r) => {
          const cor = STATUS[r.riscoGeral.classificacao];
          return (
            <div key={r.id} className="flex items-center gap-2 text-xs">
              <span
                title={r.nome}
                className="w-36 shrink-0 truncate text-neutral-600 dark:text-neutral-400"
              >
                {r.nome}
              </span>
              <div className="flex-1 h-5 rounded-r bg-neutral-100 dark:bg-neutral-900 overflow-hidden">
                <div
                  className="h-full rounded-r flex items-center justify-end pr-1.5"
                  style={{ width: `${r.riscoGeral.score}%`, backgroundColor: cor.hex }}
                >
                  {r.riscoGeral.score >= 12 && (
                    <span className="text-[10px] font-medium text-white leading-none">
                      {r.riscoGeral.score}
                    </span>
                  )}
                </div>
              </div>
              {r.riscoGeral.score < 12 && (
                <span className="w-5 shrink-0 text-[10px] text-neutral-500">
                  {r.riscoGeral.score}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
