import { Pool, type QueryResultRow } from "pg";

// Pool único por processo. Em dev o Next recria os módulos a cada hot reload,
// então guardamos no globalThis para não abrir uma conexão nova a cada edição.
const globalForPool = globalThis as unknown as { safeonPool?: Pool };

// Aceita tanto SAFEON_DB_* quanto os nomes DB_* usados pelo safeon-api, para
// que dê para colar o bloco de conexão de lá sem renomear nada.
function env(chave: string): string | undefined {
  return process.env[`SAFEON_${chave}`] ?? process.env[chave];
}

function criarPool(): Pool {
  const host = env("DB_HOST");
  const database = env("DB_NAME");
  const user = env("DB_USERNAME");
  const password = env("DB_PASSWORD");

  if (!host || !database || !user) {
    throw new Error(
      "Banco SafeOn não configurado: defina DB_HOST, DB_NAME, DB_USERNAME e DB_PASSWORD no .env",
    );
  }

  return new Pool({
    host,
    port: Number(env("DB_PORT") ?? 5432),
    database,
    user,
    password,
    // RDS usa certificado da própria AWS; não há CA local para validar.
    ssl: { rejectUnauthorized: false },
    max: 4,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
    // O cockpit é somente leitura sobre a base de homolog: qualquer INSERT/UPDATE
    // que escape para cá falha na sessão, não no banco.
    options: "-c default_transaction_read_only=on",
  });
}

export function getPool(): Pool {
  if (!globalForPool.safeonPool) globalForPool.safeonPool = criarPool();
  return globalForPool.safeonPool;
}

export async function query<T extends QueryResultRow>(
  sql: string,
  params: unknown[] = [],
): Promise<T[]> {
  const { rows } = await getPool().query<T>(sql, params);
  return rows;
}
