import type { Classificacao } from "@/lib/risk/util";
import { STATUS } from "./riskColors";

interface RiskMeterProps {
  label: string;
  sublabel: string;
  score: number; // 0-100
  classificacao: Classificacao;
}

// Meter (ver skill de dataviz): o preenchimento carrega a severidade, a
// trilha vazia é um tom mais claro e neutro. O texto nunca usa a cor do
// dado — só a barra é colorida; valor e rótulo ficam em tokens de texto.
export default function RiskMeter({ label, sublabel, score, classificacao }: RiskMeterProps) {
  const cor = STATUS[classificacao];
  const pct = Math.max(0, Math.min(100, score));

  return (
    <div>
      <div className="flex items-baseline justify-between text-xs mb-1">
        <span className="text-neutral-500">{label}</span>
        <span className="font-medium text-neutral-900 dark:text-neutral-100">
          {score} · {cor.label.replace("Risco ", "")}
        </span>
      </div>
      <div
        className="h-2 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden"
        role="meter"
        aria-label={label}
        aria-valuenow={score}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full rounded-full"
          style={{ width: `${pct}%`, backgroundColor: cor.hex }}
        />
      </div>
      <p className="text-[11px] text-neutral-500 mt-1">{sublabel}</p>
    </div>
  );
}
