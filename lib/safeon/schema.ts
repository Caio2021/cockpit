import { getPool, query } from "@/lib/db/safeon";

export interface TabelaResumo {
  tabela: string;
  linhasAprox: number;
}

export interface ColunaResumo {
  coluna: string;
  tipo: string;
  aceitaNulo: boolean;
}

// Estimativa do planner (reltuples): custo constante, ao contrário de um
// count(*) em tabela de centenas de milhares de linhas só para listar.
export async function listarTabelas(): Promise<TabelaResumo[]> {
  return query<TabelaResumo>(
    `select c.relname                                as tabela,
            greatest(c.reltuples, 0)::bigint::int    as "linhasAprox"
     from pg_class c
     join pg_namespace n on n.oid = c.relnamespace
     where n.nspname = 'public' and c.relkind = 'r'
     order by c.relname`,
  );
}

export async function descreverTabela(tabela: string): Promise<ColunaResumo[]> {
  return query<ColunaResumo>(
    `select column_name              as coluna,
            data_type               as tipo,
            is_nullable = 'YES'     as "aceitaNulo"
     from information_schema.columns
     where table_schema = 'public' and table_name = $1
     order by ordinal_position`,
    [tabela],
  );
}

const LIMITE_PADRAO = 100;
const LIMITE_MAXIMO = 500;
const TIMEOUT_MS = 15_000;

// Comandos que não têm o que fazer num cockpit de leitura. A sessão do pool já
// roda com default_transaction_read_only, e a consulta ainda vai para dentro de
// uma transação READ ONLY — esta checagem é a primeira das três barreiras, para
// devolver um erro claro à LLM em vez de um erro do Postgres.
const PROIBIDO =
  /\b(insert|update|delete|drop|alter|create|truncate|grant|revoke|copy|vacuum|analyze|call|do|merge|refresh|reindex|lock|set|reset)\b/i;

export interface ResultadoConsulta {
  sqlExecutado: string;
  linhas: Record<string, unknown>[];
  totalLinhas: number;
}

export async function consultarBase(sqlBruto: string, limite = LIMITE_PADRAO) {
  const sql = sqlBruto.trim().replace(/;+\s*$/, "");

  if (!/^(select|with)\b/i.test(sql)) {
    throw new Error("Só são aceitas consultas que começam com SELECT ou WITH.");
  }
  if (sql.includes(";")) {
    throw new Error("Envie uma única consulta, sem ponto e vírgula no meio.");
  }
  if (PROIBIDO.test(sql)) {
    throw new Error("A consulta contém um comando de escrita ou de sessão, que não é permitido.");
  }

  const teto = Math.min(Math.max(1, limite), LIMITE_MAXIMO);
  const sqlFinal = /\blimit\s+\d+\s*$/i.test(sql) ? sql : `${sql} limit ${teto}`;

  const client = await getPool().connect();
  try {
    await client.query("begin read only");
    await client.query(`set local statement_timeout = ${TIMEOUT_MS}`);
    const { rows } = await client.query(sqlFinal);
    await client.query("commit");
    return { sqlExecutado: sqlFinal, linhas: rows, totalLinhas: rows.length } satisfies ResultadoConsulta;
  } catch (erro) {
    await client.query("rollback").catch(() => {});
    throw erro;
  } finally {
    client.release();
  }
}
