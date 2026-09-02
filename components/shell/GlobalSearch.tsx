"use client";

import { useEffect, useRef, useState } from "react";
import type { ResultadoBuscaComLink } from "@/lib/safeon/tipos";

const ICONE: Record<ResultadoBuscaComLink["tipo"], string> = {
  objeto: "directions_car",
  cliente: "apartment",
  ordem: "assignment",
};

const ROTULO: Record<ResultadoBuscaComLink["tipo"], string> = {
  objeto: "Objeto",
  cliente: "Cliente",
  ordem: "Ordem de trabalho",
};

export default function GlobalSearch() {
  const [termo, setTermo] = useState("");
  const [resultados, setResultados] = useState<ResultadoBuscaComLink[]>([]);
  // Último termo cujo resultado já chegou — comparado com o que está digitado,
  // diz se há busca em andamento sem precisar de um flag separado.
  const [termoBuscado, setTermoBuscado] = useState("");
  const [aberto, setAberto] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounce de 250ms: cada tecla dispararia três queries no Postgres.
  useEffect(() => {
    const alvo = termo.trim();
    const controller = new AbortController();

    const timer = setTimeout(async () => {
      if (alvo.length < 2) {
        setResultados([]);
        setTermoBuscado(alvo);
        return;
      }

      try {
        const resposta = await fetch(`/api/busca?q=${encodeURIComponent(alvo)}`, {
          signal: controller.signal,
        });
        const dados = await resposta.json();
        setResultados(dados.resultados ?? []);
        setTermoBuscado(alvo);
      } catch {
        // Abort de digitação em sequência não é erro para o usuário.
      }
    }, 250);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [termo]);

  useEffect(() => {
    const aoClicarFora = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setAberto(false);
    };
    document.addEventListener("mousedown", aoClicarFora);
    return () => document.removeEventListener("mousedown", aoClicarFora);
  }, []);

  const buscando = termo.trim() !== termoBuscado;
  const mostrarPainel = aberto && termo.trim().length >= 2;

  return (
    <div ref={containerRef} className="relative w-full max-w-[420px]">
      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
        search
      </span>
      <input
        className="w-full bg-surface-variant border border-transparent rounded-full pl-11 pr-4 py-2.5 font-body-md text-body-md text-on-surface placeholder-on-surface-variant focus:outline-none focus:bg-surface focus:border-outline-variant transition-colors"
        placeholder="Buscar placa, cliente ou nº da OT"
        type="text"
        value={termo}
        onChange={(e) => {
          setTermo(e.target.value);
          setAberto(true);
        }}
        onFocus={() => setAberto(true)}
        onKeyDown={(e) => e.key === "Escape" && setAberto(false)}
      />

      {mostrarPainel && (
        <div className="absolute top-full mt-2 w-full card rounded-xl overflow-hidden z-50 max-h-[70vh] overflow-y-auto shadow-lg">
          {buscando && resultados.length === 0 && (
            <p className="px-4 py-3 font-body-md text-body-md text-on-surface-variant">Buscando…</p>
          )}

          {!buscando && resultados.length === 0 && (
            <p className="px-4 py-3 font-body-md text-body-md text-on-surface-variant">
              Nada encontrado para “{termo.trim()}”.
            </p>
          )}

          {resultados.map((r) => (
            <a
              key={`${r.tipo}-${r.id}`}
              href={r.url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 px-4 py-3 hover:bg-surface-variant transition-colors border-b border-outline-variant last:border-0"
            >
              <span className="w-9 h-9 rounded-lg bg-surface-variant text-on-surface-variant flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[18px]">{ICONE[r.tipo]}</span>
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-body-md text-body-md text-on-surface font-medium truncate">
                  {r.titulo}
                </span>
                <span className="block font-label-sm text-label-sm text-on-surface-variant truncate">
                  {ROTULO[r.tipo]}
                  {r.subtitulo ? ` · ${r.subtitulo}` : ""}
                </span>
              </span>
              <span className="material-symbols-outlined text-[18px] text-on-surface-variant shrink-0">
                open_in_new
              </span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
