interface DonutRingProps {
  valor: number; // percentual 0-100
  legenda: string;
}

// Anel fino de cobertura: trilho neutro + arco colorido pela própria leitura de
// severidade (quanto mais da base reporta, melhor).
export default function DonutRing({ valor, legenda }: DonutRingProps) {
  const clamped = Math.max(0, Math.min(100, valor));
  const cor = clamped >= 80 ? "stroke-tertiary" : clamped >= 40 ? "stroke-primary-container" : "stroke-error";

  return (
    <div className="flex flex-col items-center shrink-0">
      <div className="relative w-[72px] h-[72px] flex items-center justify-center">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
          <circle className="stroke-surface-variant" cx="18" cy="18" r="16" fill="none" strokeWidth="3.5" />
          {/* Em 0% o arco não é desenhado: a ponta arredondada de um traço de
              comprimento zero vira um ponto solto em cima do trilho. */}
          {clamped > 0 && (
            <circle
              className={cor}
              cx="18"
              cy="18"
              r="16"
              fill="none"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeDasharray="100 100"
              strokeDashoffset={100 - clamped}
              pathLength={100}
            />
          )}
        </svg>
        <span className="absolute font-headline-md text-on-surface font-bold text-[15px]">
          {clamped}%
        </span>
      </div>
      <p className="font-label-sm text-label-xs text-on-surface-variant mt-2 text-center">{legenda}</p>
    </div>
  );
}
