import type { RiscoCliente } from "@/lib/safeon/risco";
import { RISK_TOKENS } from "./riskTokens";
import DonutRing from "./DonutRing";

function Modulo({
  icone,
  valor,
  label,
  alerta = false,
}: {
  icone: string;
  valor: number;
  label: string;
  alerta?: boolean;
}) {
  return (
    <div className="rounded-xl bg-background border border-outline-variant p-3.5 flex flex-col gap-1">
      <span
        className={`material-symbols-outlined text-[18px] ${alerta ? "text-error" : "text-on-surface-variant"}`}
      >
        {icone}
      </span>
      <span
        className={`font-headline-md text-[20px] leading-7 font-bold ${alerta ? "text-error" : "text-on-surface"}`}
      >
        {valor.toLocaleString("pt-BR")}
      </span>
      <span className="font-label-sm text-label-xs text-on-surface-variant">{label}</span>
    </div>
  );
}

export default function ClienteRiscoCard({
  posicao,
  cliente,
}: {
  posicao: number;
  cliente: RiscoCliente;
}) {
  const tokens = RISK_TOKENS[cliente.classificacao];
  const fatia = (n: number) => (cliente.total > 0 ? (n / cliente.total) * 100 : 0);

  return (
    <article className="card rounded-2xl p-5 flex flex-col gap-5 hover:border-navy-200 transition-colors">
      <header className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <span className="w-7 h-7 rounded-lg bg-surface-variant text-on-surface-variant font-label-sm text-label-sm font-bold flex items-center justify-center shrink-0">
            {posicao}
          </span>
          <div className="min-w-0">
            <h3 className="font-headline-md text-headline-md text-on-surface truncate">
              {cliente.nome}
            </h3>
            <p className="font-body-md text-body-md text-on-surface-variant">
              {cliente.total.toLocaleString("pt-BR")} objetos monitorados
            </p>
          </div>
        </div>
        <span
          className={`${tokens.badgeBg} border ${tokens.badgeBorder} ${tokens.badgeText} px-3 py-1.5 rounded-full font-label-sm text-label-sm flex items-center gap-2 font-semibold shrink-0`}
        >
          <span className={`w-2 h-2 rounded-full ${tokens.dotBg}`} />
          {tokens.label}
        </span>
      </header>

      <div className="rounded-xl bg-background border border-outline-variant p-4 flex items-center gap-5">
        <DonutRing valor={cliente.percentualReportando} legenda="Reportando" />

        <div className="flex-1 min-w-0">
          <p className="font-label-sm text-label-sm text-on-surface-variant mb-2">
            Composição da base no snapshot
          </p>
          <div className="h-2 rounded-full bg-surface-variant overflow-hidden flex">
            <div className="bg-tertiary h-full" style={{ width: `${fatia(cliente.reportando)}%` }} />
            <div
              className="bg-primary-container h-full"
              style={{ width: `${fatia(cliente.parcial)}%` }}
            />
            <div className="bg-error h-full" style={{ width: `${fatia(cliente.semPosicao)}%` }} />
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3">
            {[
              { cor: "bg-tertiary", label: "Reportando", valor: cliente.reportando },
              { cor: "bg-primary-container", label: "Parcial", valor: cliente.parcial },
              { cor: "bg-error", label: "Sem posição", valor: cliente.semPosicao },
            ].map((item) => (
              <span
                key={item.label}
                className="flex items-center gap-1.5 font-label-sm text-label-sm text-on-surface-variant"
              >
                <span className={`w-2 h-2 rounded-full ${item.cor}`} />
                {item.label}
                <span className="text-on-surface font-semibold">
                  {item.valor.toLocaleString("pt-BR")}
                </span>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Modulo
          icone="location_off"
          valor={cliente.semPosicao}
          label="Sem posição"
          alerta={cliente.percentualSemPosicao >= 50}
        />
        <Modulo icone="cell_tower" valor={cliente.parcial} label="Parcial" />
        <Modulo
          icone="crisis_alert"
          valor={cliente.alertasAbertos}
          label="Alertas abertos"
          alerta={cliente.alertasAbertos > 0}
        />
      </div>

      <div>
        <div className="flex items-baseline justify-between mb-2">
          <span className="font-label-sm text-label-sm text-on-surface-variant">Score de risco</span>
          <span className={`font-body-md text-body-md font-semibold ${tokens.badgeText}`}>
            {cliente.score}
            <span className="text-on-surface-variant font-normal"> / 100</span>
          </span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-surface-variant overflow-hidden">
          <div className={`h-full rounded-full ${tokens.meterBg}`} style={{ width: `${cliente.score}%` }} />
        </div>
      </div>
    </article>
  );
}
