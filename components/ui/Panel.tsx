import type { ReactNode } from "react";

export default function Panel({
  titulo,
  subtitulo,
  acao,
  children,
}: {
  titulo: string;
  subtitulo?: string;
  acao?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="card rounded-xl p-6">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h2 className="font-headline-md text-headline-md text-on-surface">{titulo}</h2>
          {subtitulo && (
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">{subtitulo}</p>
          )}
        </div>
        {acao && <div className="shrink-0">{acao}</div>}
      </div>
      {children}
    </section>
  );
}
