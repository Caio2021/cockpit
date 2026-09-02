import type { AlertasPorDia } from "@/lib/safeon/tipos";

const DIAS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

// Barras verticais com escala linear a partir do maior valor da janela,
// arredondado para cima num múltiplo "redondo" para os ticks do eixo.
export default function AlertasChart({ dados }: { dados: AlertasPorDia[] }) {
  const maximo = Math.max(1, ...dados.map((d) => d.total));
  const passo = Math.max(1, Math.ceil(maximo / 4));
  const topo = passo * 4;
  const ticks = [4, 3, 2, 1, 0].map((i) => i * passo);

  return (
    <div className="flex gap-4">
      <div className="flex flex-col justify-between h-40 font-label-sm text-label-sm text-on-surface-variant text-right w-8 shrink-0">
        {ticks.map((t) => (
          <span key={t}>{t}</span>
        ))}
      </div>
      <div className="flex-1 min-w-0">
        <div className="h-40 flex items-end justify-between gap-2 border-b border-outline-variant">
          {dados.map((d) => {
            const altura = (d.total / topo) * 100;
            return (
              <div key={d.dia} className="flex-1 flex flex-col items-center justify-end h-full">
                <span className="font-label-sm text-label-sm text-on-surface mb-1">
                  {d.total > 0 ? d.total : ""}
                </span>
                <div
                  className="w-full max-w-[36px] rounded-t bg-gradient-to-b from-navy-600 to-navy-800"
                  style={{ height: `${Math.max(altura, d.total > 0 ? 3 : 0)}%` }}
                />
              </div>
            );
          })}
        </div>
        <div className="flex justify-between gap-2 mt-2">
          {dados.map((d) => (
            <span
              key={d.dia}
              className="flex-1 text-center font-label-sm text-label-sm text-on-surface-variant"
            >
              {DIAS[new Date(`${d.dia}T12:00:00Z`).getUTCDay()]}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
