"use client";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  const semBanco = /SAFEON_DB|DB_HOST|ECONNREFUSED|password|timeout/i.test(error.message);

  return (
    <div className="card rounded-xl p-8 max-w-2xl">
      <div className="flex items-center gap-3 mb-4">
        <span className="w-10 h-10 rounded-lg bg-error/10 text-error flex items-center justify-center">
          <span className="material-symbols-outlined">error</span>
        </span>
        <h1 className="font-headline-md text-headline-md text-on-surface">
          {semBanco ? "Não consegui falar com o banco do SafeOn" : "Algo quebrou nesta tela"}
        </h1>
      </div>
      <p className="font-body-md text-body-md text-on-surface-variant mb-2">{error.message}</p>
      {semBanco && (
        <p className="font-body-md text-body-md text-on-surface-variant mb-6">
          Confira DB_HOST, DB_NAME, DB_USERNAME e DB_PASSWORD no .env e se este IP está liberado no
          security group do RDS.
        </p>
      )}
      <button
        type="button"
        onClick={reset}
        className="bg-navy-800 text-pure-white rounded-lg px-4 py-2.5 font-body-md text-body-md hover:bg-navy-700 transition-colors"
      >
        Tentar de novo
      </button>
    </div>
  );
}
