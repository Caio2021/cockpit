export default function StatTile({
  label,
  valor,
  rodape,
  icone,
  destaque = false,
}: {
  label: string;
  valor: string | number;
  rodape: string;
  icone: string;
  destaque?: boolean;
}) {
  if (destaque) {
    return (
      <div className="card-navy rounded-xl p-5 flex flex-col">
        <div className="flex justify-between items-start mb-4">
          <span className="font-body-md text-body-md text-navy-100">{label}</span>
          <span className="w-9 h-9 rounded-lg bg-primary-container/20 text-primary-container flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px]">{icone}</span>
          </span>
        </div>
        <p className="text-[40px] leading-[48px] font-bold text-pure-white mb-2">{valor}</p>
        <p className="font-body-md text-body-md text-navy-200">{rodape}</p>
      </div>
    );
  }

  return (
    <div className="card rounded-xl p-5 flex flex-col">
      <div className="flex justify-between items-start mb-4">
        <span className="font-body-md text-body-md text-on-surface-variant">{label}</span>
        <span className="w-9 h-9 rounded-lg bg-surface-variant text-on-surface-variant flex items-center justify-center">
          <span className="material-symbols-outlined text-[20px]">{icone}</span>
        </span>
      </div>
      <p className="text-[40px] leading-[48px] font-bold text-on-surface mb-2">{valor}</p>
      <p className="font-body-md text-body-md text-on-surface-variant">{rodape}</p>
    </div>
  );
}
