import { NextResponse } from "next/server";
import { buscaGlobal } from "@/lib/safeon/queries";
import type { ResultadoBusca, ResultadoBuscaComLink } from "@/lib/safeon/tipos";

// Rotas reais do front do SafeOn (src/router/routes) — o cockpit é só a leitura
// agregada, então cada resultado leva para a tela que já sabe editar o registro.
function montarUrl(base: string, r: ResultadoBusca): string {
  const caminho =
    r.tipo === "objeto"
      ? `tracking/trackable-object/${r.id}`
      : r.tipo === "cliente"
        ? `client/${r.id}/dashboard`
        : `recovery/work-order/${r.id}`;
  return `${base.replace(/\/$/, "")}/app/${caminho}`;
}

export async function GET(request: Request) {
  const termo = new URL(request.url).searchParams.get("q")?.trim() ?? "";

  // Menos de 2 caracteres varre a base inteira sem trazer nada útil.
  if (termo.length < 2) return NextResponse.json({ resultados: [] });

  const base = process.env.SAFEON_APP_URL ?? "http://localhost:8080";

  try {
    const resultados: ResultadoBuscaComLink[] = (await buscaGlobal(termo)).map((r) => ({
      ...r,
      url: montarUrl(base, r),
    }));
    return NextResponse.json({ resultados });
  } catch (erro) {
    const mensagem = erro instanceof Error ? erro.message : "Falha na busca";
    return NextResponse.json({ resultados: [], erro: mensagem }, { status: 500 });
  }
}
