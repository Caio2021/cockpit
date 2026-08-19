export default function Header() {
  return (
    <header className="glass-card flex justify-between items-center px-gutter py-4 w-full sticky top-0 z-40">
      <div className="flex items-center gap-6">
        <div className="font-headline-lg text-headline-lg font-bold text-on-surface">
          Project Cockpit
        </div>
        <nav className="hidden md:flex gap-6 ml-8">
          <button
            type="button"
            className="text-primary-container border-b-2 border-primary-container pb-1 font-body-lg text-body-lg transition-all font-semibold"
          >
            Dashboard
          </button>
          <button
            type="button"
            className="text-on-surface-variant hover:text-on-surface transition-colors pb-1 font-body-lg text-body-lg"
          >
            Portfolio
          </button>
          <button
            type="button"
            className="text-on-surface-variant hover:text-on-surface transition-colors pb-1 font-body-lg text-body-lg"
          >
            Analytics
          </button>
          <button
            type="button"
            className="text-on-surface-variant hover:text-on-surface transition-colors pb-1 font-body-lg text-body-lg"
          >
            Reports
          </button>
        </nav>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative hidden sm:block">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">
            search
          </span>
          <input
            className="bg-surface-container-lowest border border-outline-variant rounded-full pl-10 pr-4 py-2 text-sm text-on-surface focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all placeholder-on-surface-variant"
            placeholder="Search projects..."
            type="text"
          />
        </div>
        <button
          type="button"
          className="text-on-surface-variant hover:text-on-surface hover:bg-surface-variant p-2 rounded-full transition-colors relative"
        >
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-2 right-2 w-2 h-2 bg-primary-container rounded-full" />
        </button>
        <button
          type="button"
          className="text-on-surface-variant hover:text-on-surface hover:bg-surface-variant p-2 rounded-full transition-colors"
        >
          <span className="material-symbols-outlined">settings</span>
        </button>
        <div className="w-8 h-8 rounded-full bg-primary-container/20 border border-primary-container/30 overflow-hidden flex items-center justify-center">
          <span className="material-symbols-outlined text-primary-container">person</span>
        </div>
      </div>
    </header>
  );
}
