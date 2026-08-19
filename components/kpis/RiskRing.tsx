interface RiskRingProps {
  value: number; // percentual bruto, pode ser negativo (ex.: orçamento sob controle)
  strokeClass: string; // classe Tailwind completa, ex. "stroke-error"
  displayValue: string;
  label: string;
}

// Donut de indicador: mesma convenção do mockup original (raio 16,
// dasharray "100" ~ circunferência, dashoffset = 100 - valor clampado).
export default function RiskRing({ value, strokeClass, displayValue, label }: RiskRingProps) {
  const clamped = Math.max(0, Math.min(100, value));
  const dashoffset = 100 - clamped;

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-sm">
      <div className="relative w-16 h-16 flex items-center justify-center">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
          <circle className="stroke-surface-variant" cx="18" cy="18" fill="none" r="16" strokeWidth="4" />
          <circle
            className={strokeClass}
            cx="18"
            cy="18"
            fill="none"
            r="16"
            strokeDasharray="100"
            strokeDashoffset={dashoffset}
            strokeWidth="4"
            strokeLinecap="round"
          />
        </svg>
        <span className="absolute font-headline-md text-on-surface font-bold text-sm">
          {displayValue}
        </span>
      </div>
      <p className="font-label-sm text-label-xs text-on-surface-variant uppercase mt-3 text-center">
        {label}
      </p>
    </div>
  );
}
