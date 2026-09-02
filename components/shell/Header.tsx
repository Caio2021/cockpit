import GlobalSearch from "./GlobalSearch";

export default function Header() {
  return (
    <header className="bg-surface border-b border-outline-variant h-16 flex items-center shrink-0 z-40">
      <div className="w-60 shrink-0 px-6 flex items-center">
        <span className="text-[26px] leading-none font-semibold tracking-tight text-navy-900">
          safe <span className="text-primary-container">on</span>
        </span>
      </div>

      <div className="flex-1 flex justify-center px-6">
        <GlobalSearch />
      </div>

      <div className="flex items-center gap-2 px-6">
        <button
          type="button"
          className="text-on-surface-variant hover:text-on-surface hover:bg-surface-variant p-2 rounded-lg transition-colors relative"
        >
          <span className="material-symbols-outlined text-[22px]">notifications</span>
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-primary-container rounded-full" />
        </button>
        <button
          type="button"
          className="text-on-surface-variant hover:text-on-surface hover:bg-surface-variant p-2 rounded-lg transition-colors"
        >
          <span className="material-symbols-outlined text-[22px]">shield</span>
        </button>

        <button
          type="button"
          className="flex items-center gap-2 border border-outline-variant rounded-lg pl-3 pr-2 py-2 hover:bg-surface-variant transition-colors ml-1"
        >
          <span className="material-symbols-outlined text-on-surface-variant text-[18px]">
            apartment
          </span>
          <span className="font-body-md text-body-md text-on-surface font-medium">SafeOn</span>
          <span className="material-symbols-outlined text-on-surface-variant text-[18px]">
            expand_more
          </span>
        </button>

        <button type="button" className="flex items-center gap-1 ml-1">
          <span className="w-9 h-9 rounded-full bg-navy-800 text-pure-white font-label-sm text-label-sm font-semibold flex items-center justify-center">
            CR
          </span>
          <span className="material-symbols-outlined text-on-surface-variant text-[18px]">
            expand_more
          </span>
        </button>
      </div>
    </header>
  );
}
