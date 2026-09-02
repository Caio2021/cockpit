import { query } from "@/lib/db/safeon";
import type {
  AlertasPorCliente,
  AlertasPorDia,
  ClienteSaudeBase,
  OrdemAberta,
  ResultadoBusca,
  ResumoAlertas,
  ResumoObjetos,
  ResumoOrdens,
} from "./tipos";

// O SafeOn é multi-tenant: toda tabela relevante tem customerId. Quando
// SAFEON_CUSTOMER_ID está definido, o cockpit enxerga só aquele tenant;
// sem ele, agrega a base inteira de homolog.
function tenant(): number | null {
  const raw = process.env.SAFEON_CUSTOMER_ID;
  return raw ? Number(raw) : null;
}

// Status de alerta considerados abertos (não terminais). Espelha a validação
// do model alertViolation no safeon-api: terminais são Finalizado e Expirado,
// e os "Falso*" encerram a tratativa.
const STATUS_ABERTOS = ["Novo", "Em Andamento", "Real"];
const STATUS_FINALIZADOS = ["Finalizado", "Expirado", "Falso", "Falso Blacklist"];

export async function getSaudeBasePorCliente(): Promise<ClienteSaudeBase[]> {
  const t = tenant();
  const rows = await query<{
    clienteId: number | null;
    nome: string;
    total: number;
    reportando: number;
    parcial: number;
    semposicao: number;
    datareferencia: string;
  }>(
    `with ultima_run as (
       select id, "referenceDate"
       from base_health_runs
       where status = 'success'
       order by "referenceDate" desc, "startedAt" desc
       limit 1
     )
     select o."clientId"                                        as "clienteId",
            coalesce(o."clientName", 'Sem cliente')             as nome,
            count(*)::int                                       as total,
            count(*) filter (where o.status = 'green')::int     as reportando,
            count(*) filter (where o.status = 'yellow')::int    as parcial,
            count(*) filter (where o.status = 'red')::int       as semposicao,
            max(r."referenceDate")::text                        as datareferencia
     from base_health_objects o
     join ultima_run r on r.id = o."runId"
     where ($1::int is null or o."customerId" = $1::int)
     group by o."clientId", o."clientName"
     order by count(*) desc`,
    [t],
  );

  return rows.map((r) => ({
    clienteId: r.clienteId,
    nome: r.nome,
    total: r.total,
    reportando: r.reportando,
    parcial: r.parcial,
    semPosicao: r.semposicao,
    dataReferencia: r.datareferencia,
  }));
}

export async function getResumoAlertas(): Promise<ResumoAlertas> {
  const t = tenant();
  const [row] = await query<{
    total: number;
    novos: number;
    ematratamento: number;
    finalizados: number;
  }>(
    `select count(*)::int                                            as total,
            count(*) filter (where status = 'Novo')::int             as novos,
            count(*) filter (where status = any($2::text[]))::int    as ematratamento,
            count(*) filter (where status = any($3::text[]))::int    as finalizados
     from "alertViolations"
     where ($1::int is null or "customerId" = $1::int)`,
    [t, ["Em Andamento", "Real"], STATUS_FINALIZADOS],
  );

  return {
    total: row?.total ?? 0,
    novos: row?.novos ?? 0,
    emTratamento: row?.ematratamento ?? 0,
    finalizados: row?.finalizados ?? 0,
  };
}

export async function getAlertasPorDia(dias = 7): Promise<AlertasPorDia[]> {
  const t = tenant();
  const rows = await query<{ dia: string; total: number }>(
    `select to_char(date_trunc('day', "dateTimeEvent"), 'YYYY-MM-DD') as dia,
            count(*)::int                                            as total
     from "alertViolations"
     where "dateTimeEvent" >= now() - ($2::int * interval '1 day')
       and ($1::int is null or "customerId" = $1::int)
     group by 1
     order by 1`,
    [t, dias],
  );
  return rows;
}

export async function getAlertasAbertosPorCliente(limite = 20): Promise<AlertasPorCliente[]> {
  const t = tenant();
  const rows = await query<{ clienteId: number | null; nome: string; abertos: number }>(
    `select e.id                                        as "clienteId",
            coalesce(e."businessName", 'Sem cliente')   as nome,
            count(*)::int                               as abertos
     from "alertViolations" av
     join "trackableObjects" t on t.id = av."trackableObjectId"
     left join entities e on e.id = t."clientId"
     where av.status = any($2::text[])
       and ($1::int is null or av."customerId" = $1::int)
     group by e.id, e."businessName"
     order by count(*) desc
     limit $3`,
    [t, STATUS_ABERTOS, limite],
  );
  return rows;
}

export async function getOrdensAbertas(limite = 50): Promise<OrdemAberta[]> {
  const t = tenant();
  const rows = await query<{
    id: number;
    cliente: string | null;
    placa: string | null;
    tipo: string;
    status: string;
    diasaberta: number;
    eventdate: string | null;
  }>(
    `select w.id,
            e."businessName"                                                        as cliente,
            o.plate                                                                 as placa,
            ty.name                                                                 as tipo,
            s.name                                                                  as status,
            floor(extract(epoch from (now() - coalesce(w."eventDate", w."createdAt"))) / 86400)::int as diasaberta,
            to_char(w."eventDate", 'YYYY-MM-DD')                                    as eventdate
     from "workOrders" w
     join "workOrderStatuses" s on s.id = w."statusId"
     join "workOrderTypes" ty on ty.id = w."typeId"
     left join "trackableObjects" o on o.id = w."trackableObjectId"
     left join entities e on e.id = w."clientId"
     where s."isFinal" = false
       and w."closedAt" is null
       and ($1::int is null or w."customerId" = $1::int)
     order by diasaberta desc
     limit $2`,
    [t, limite],
  );

  return rows.map((r) => ({
    id: r.id,
    cliente: r.cliente,
    placa: r.placa,
    tipo: r.tipo,
    status: r.status,
    diasAberta: r.diasaberta,
    eventDate: r.eventdate,
  }));
}

export async function getResumoOrdens(): Promise<ResumoOrdens> {
  const t = tenant();
  const [row] = await query<{ abertas: number; fechadas30d: number; maisantiga: number }>(
    `select count(*) filter (where s."isFinal" = false and w."closedAt" is null)::int as abertas,
            count(*) filter (where w."closedAt" >= now() - interval '30 days')::int   as fechadas30d,
            coalesce(max(
              case when s."isFinal" = false and w."closedAt" is null
                   then floor(extract(epoch from (now() - coalesce(w."eventDate", w."createdAt"))) / 86400)
              end
            ), 0)::int                                                                as maisantiga
     from "workOrders" w
     join "workOrderStatuses" s on s.id = w."statusId"
     where ($1::int is null or w."customerId" = $1::int)`,
    [t],
  );

  return {
    abertas: row?.abertas ?? 0,
    fechadas30d: row?.fechadas30d ?? 0,
    maisAntigaDias: row?.maisantiga ?? 0,
  };
}

export async function getResumoObjetos(): Promise<ResumoObjetos> {
  const t = tenant();
  const [row] = await query<{
    total: number;
    ativos: number;
    emrecuperacao: number;
    semdispositivo: number;
  }>(
    `select count(*)::int                                                as total,
            count(*) filter (where o.status = 'active')::int             as ativos,
            count(*) filter (where o.status = 'recovery')::int           as emrecuperacao,
            count(*) filter (where d.id is null)::int                    as semdispositivo
     from "trackableObjects" o
     left join lateral (
       select 1 as id from devices d where d."trackableObjectId" = o.id limit 1
     ) d on true
     where ($1::int is null or o."customerId" = $1::int)`,
    [t],
  );

  return {
    total: row?.total ?? 0,
    ativos: row?.ativos ?? 0,
    emRecuperacao: row?.emrecuperacao ?? 0,
    semDispositivo: row?.semdispositivo ?? 0,
  };
}

export async function buscaGlobal(termo: string, limite = 6): Promise<ResultadoBusca[]> {
  const t = tenant();
  const alvo = `%${termo.trim()}%`;
  // Placa é gravada sem separadores e em caixa alta (hook beforeSave do model),
  // então normalizamos o termo do mesmo jeito antes de comparar.
  const placa = `%${termo.trim().toUpperCase().replace(/[^A-Z0-9]/g, "")}%`;
  const numero = /^\d+$/.test(termo.trim()) ? Number(termo.trim()) : null;

  const [objetos, clientes, ordens] = await Promise.all([
    query<{ id: number; titulo: string; subtitulo: string }>(
      `select o.id,
              coalesce(o.plate, o."serialNumber", 'sem placa')                as titulo,
              concat_ws(' · ', e."businessName", o."modelBrand", o.status)    as subtitulo
       from "trackableObjects" o
       left join entities e on e.id = o."clientId"
       where (o.plate ilike $2 or o."serialNumber" ilike $3)
         and ($1::int is null or o."customerId" = $1::int)
       order by o.plate
       limit $4`,
      [t, placa, alvo, limite],
    ),
    query<{ id: number; titulo: string; subtitulo: string }>(
      `select e.id,
              e."businessName"                          as titulo,
              concat_ws(' · ', e."documentType", e.document, e.status) as subtitulo
       from entities e
       join clients c on c.id = e.id
       where (e."businessName" ilike $2 or e.document ilike $2)
         and ($1::int is null or e."customerId" = $1::int)
       order by e."businessName"
       limit $3`,
      [t, alvo, limite],
    ),
    query<{ id: number; titulo: string; subtitulo: string }>(
      `select w.id,
              concat('OT #', w.id)                                  as titulo,
              concat_ws(' · ', o.plate, e."businessName", s.name)   as subtitulo
       from "workOrders" w
       join "workOrderStatuses" s on s.id = w."statusId"
       left join "trackableObjects" o on o.id = w."trackableObjectId"
       left join entities e on e.id = w."clientId"
       where (($2::int is not null and w.id = $2::int) or o.plate ilike $3)
         and ($1::int is null or w."customerId" = $1::int)
       order by w.id desc
       limit $4`,
      [t, numero, placa, limite],
    ),
  ]);

  return [
    ...objetos.map((r) => ({ ...r, tipo: "objeto" as const })),
    ...clientes.map((r) => ({ ...r, tipo: "cliente" as const })),
    ...ordens.map((r) => ({ ...r, tipo: "ordem" as const })),
  ];
}
