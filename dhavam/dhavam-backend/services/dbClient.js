
const mysql = require("mysql2/promise");

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is missing");
}

const dbUrl = new URL(databaseUrl.trim().replace(/^"|"$/g, ""));

const config = {
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
};

const pool = mysql.createPool(config);

// Verify selected database
pool.query("SELECT DATABASE() AS databaseName")
  .then(([rows]) => {
    console.log("Connected database:", rows[0].databaseName);
  })
  .catch((error) => {
    console.error("Database connection error:", error.message);
  });

module.exports = pool;
