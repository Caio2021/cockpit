export default function PageHeader({
  titulo,
  subtitulo,
  aba,
}: {
  titulo: string;
  subtitulo: string;
  aba: string;
}) {
  return (
    <>
      <div className="mb-6">
        <h1 className="font-headline-lg text-headline-lg text-on-surface">{titulo}</h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant mt-1">{subtitulo}</p>
      </div>
      <div className="border-b border-outline-variant mb-7 flex gap-6">
        <span className="pb-3 -mb-px border-b-2 border-primary-container text-on-surface font-body-lg text-body-lg font-medium">
          {aba}
        </span>
      </div>
    </>
  );
}
