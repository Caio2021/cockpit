// Utilitário de desenvolvimento: imprime colunas e contagem das tabelas do
// SafeOn que o cockpit consome. Rode com:
//   node --env-file=.env scripts/inspecionar-schema.mjs
import pg from "pg";

const TABELAS = [
  "entities", "clients", "customers",
  "trackableObjects", "devices",
  "alertViolations", "alertRules",
  "workOrders", "workOrderStatuses", "workOrderTypes",
  "serviceOrders", "serviceOrderStatuses",
  "base_health_runs", "base_health_objects", "base_health_tenant_summaries",
];

const env = (chave) => process.env[`SAFEON_${chave}`] ?? process.env[chave];

const pool = new pg.Pool({
  host: env("DB_HOST"),
  port: Number(env("DB_PORT") ?? 5432),
  database: env("DB_NAME"),
  user: env("DB_USERNAME"),
  password: env("DB_PASSWORD"),
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 10_000,
});

for (const tabela of TABELAS) {
  const { rows: cols } = await pool.query(
    `select column_name, data_type from information_schema.columns
     where table_schema = 'public' and table_name = $1 order by ordinal_position`,
    [tabela],
  );
  if (cols.length === 0) {
    console.log(`\n### ${tabela}: NÃO EXISTE`);
    continue;
  }
  const { rows: cnt } = await pool.query(`select count(*)::int n from "${tabela}"`);
  console.log(`\n### ${tabela} (${cnt[0].n} linhas)`);
  console.log(cols.map((c) => `${c.column_name}:${c.data_type}`).join(", "));
}

await pool.end();
