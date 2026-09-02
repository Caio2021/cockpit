"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const MODULOS = [
  { href: "/", icone: "dashboard", label: "Painel" },
  { href: "/clientes", icone: "groups", label: "Saúde da Base" },
  { href: "/alertas", icone: "warning", label: "Alertas" },
  { href: "/ordens", icone: "assignment", label: "Ordens de Trabalho" },
  { href: "/objetos", icone: "directions_car", label: "Objetos Rastreáveis" },
];

export default function Sidebar({ inicialRecolhido }: { inicialRecolhido: boolean }) {
  const pathname = usePathname();
  const [recolhido, setRecolhido] = useState(inicialRecolhido);

  // Cookie (e não localStorage) porque quem decide a largura no primeiro render
  // é o layout no servidor — assim o menu já nasce recolhido, sem piscar.
  const alternar = () => {
    const proximo = !recolhido;
    setRecolhido(proximo);
    document.cookie = `menu-recolhido=${proximo ? "1" : "0"}; path=/; max-age=31536000; samesite=lax`;
  };

  return (
    <aside
      className={`bg-navy-800 shrink-0 flex flex-col h-full overflow-y-auto overflow-x-hidden transition-[width] duration-200 ${
        recolhido ? "w-[72px]" : "w-60"
      }`}
    >
      <div className={`pt-4 pb-5 ${recolhido ? "px-3.5" : "px-4"}`}>
        <button
          type="button"
          onClick={alternar}
          aria-expanded={!recolhido}
          aria-label={recolhido ? "Expandir menu" : "Recolher menu"}
          title={recolhido ? "Expandir menu" : "Recolher menu"}
          className="w-11 h-11 rounded-lg bg-navy-700 text-navy-100 flex items-center justify-center hover:bg-navy-600 transition-colors"
        >
          <span className="material-symbols-outlined text-[22px]">
            {recolhido ? "menu_open" : "menu"}
          </span>
        </button>
      </div>

      <nav className="flex flex-col">
        {MODULOS.map((m) => {
          const ativo = pathname === m.href;
          return (
            <Link
              key={m.href}
              href={m.href}
              title={recolhido ? m.label : undefined}
              className={`flex items-center gap-3 py-3.5 font-body-lg text-body-lg transition-colors ${
                recolhido ? "px-0 justify-center" : "px-6"
              } ${
                ativo
                  ? "bg-surface text-navy-900 font-medium"
                  : "text-navy-100 hover:bg-navy-700"
              }`}
            >
              <span
                className={`material-symbols-outlined text-[20px] shrink-0 ${ativo ? "" : "text-navy-200"}`}
              >
                {m.icone}
              </span>
              {!recolhido && (
                <>
                  <span className="flex-1">{m.label}</span>
                  {!ativo && (
                    <span className="material-symbols-outlined text-[18px] text-navy-200 shrink-0">
                      chevron_right
                    </span>
                  )}
                </>
              )}
            </Link>
          );
        })}
      </nav>

      <div className={`mt-auto py-6 ${recolhido ? "px-3.5" : "px-4"}`}>
        <span
          title={recolhido ? "Base de homologação" : undefined}
          className={`text-navy-200 py-2.5 flex items-center gap-3 font-body-md text-body-md ${
            recolhido ? "justify-center" : "px-2"
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">database</span>
          {!recolhido && <span className="truncate">Base de homologação</span>}
        </span>
      </div>
    </aside>
  );
}
