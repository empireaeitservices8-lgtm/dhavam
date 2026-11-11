import mysql from "mysql2/promise";

const DATABASE_URL =
  process.env.DATABASE_URL ||
  "mysql://3jWo1Qc52mbYVmw.root:jhI9Rm1CzmmplOdW@gateway01.ap-northeast-1.prod.aws.tidbcloud.com:4000/dhavam_spices?sslaccept=strict";

function createPool() {
  const cleanUrl = DATABASE_URL.trim().replace(/^"|"$/g, "");
  const dbUrl = new URL(cleanUrl);

  return mysql.createPool({
    host: dbUrl.hostname,
    port: Number(dbUrl.port || 4000),
    user: decodeURIComponent(dbUrl.username),
    password: decodeURIComponent(dbUrl.password),
    database: dbUrl.pathname.replace(/^\/+/, ""),
    ssl: {
      minVersion: "TLSv1.2",
      rejectUnauthorized: true,
    },
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });
}

const globalForDb = globalThis as unknown as {
  dbPool: mysql.Pool | undefined;
};

export const pool = globalForDb.dbPool ?? createPool();

if (process.env.NODE_ENV !== "production") {
  globalForDb.dbPool = pool;
}

export async function query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  const [rows] = await pool.execute(sql, params);
  return rows as T[];
}
