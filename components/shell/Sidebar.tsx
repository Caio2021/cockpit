export default function Sidebar() {
  return (
    <aside className="bg-surface border-r border-outline-variant shadow-sm flex flex-col h-full fixed left-0 top-0 pt-6 w-64 z-50">
      <div className="px-6 mb-8">
        <div className="flex items-center gap-2 h-16 mb-2">
          <span className="material-symbols-outlined text-primary-container text-[32px]">
            apartment
          </span>
          <span className="font-headline-md text-headline-md font-bold text-on-surface leading-none">
            Rottas
          </span>
        </div>
        <p className="font-label-sm text-label-sm uppercase text-on-surface-variant mt-2 tracking-widest">
          Enterprise Suite
        </p>
      </div>

      <nav className="flex-1 flex flex-col gap-2 px-4">
        <button
          type="button"
          className="bg-primary-container/10 text-primary-container rounded-lg px-4 py-3 flex items-center gap-3 font-label-sm text-label-sm uppercase transition-all duration-300 font-bold"
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
            dashboard
          </span>
          Overview
        </button>
      </nav>

      <div className="p-6 mt-auto">
        <button
          type="button"
          className="w-full bg-primary-container text-pure-white font-label-sm text-label-sm uppercase py-3 rounded-lg shadow-md hover:opacity-90 transition-opacity flex items-center justify-center gap-2 mb-6"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          Add Project
        </button>
        <div className="flex flex-col gap-2 border-t border-outline-variant pt-4">
          <button
            type="button"
            className="text-on-surface-variant hover:bg-surface-variant px-2 py-2 flex items-center gap-3 font-label-sm text-label-sm uppercase rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined text-sm">help</span> Support
          </button>
          <button
            type="button"
            className="text-on-surface-variant hover:bg-surface-variant px-2 py-2 flex items-center gap-3 font-label-sm text-label-sm uppercase rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined text-sm">logout</span> Sign Out
          </button>
        </div>
      </div>
    </aside>
  );
}
