import pg from "pg";
import { DB_NAME, DB_USER, DB_PASSWORD } from "../constants.js";

const { Pool } = pg;
let pool;

const buildPoolConfig = () => ({
  host: process.env.PGHOST || "localhost",
  port: Number(process.env.PGPORT) || 5432,
  user: process.env.PGUSER || DB_USER,
  password: process.env.PGPASSWORD || DB_PASSWORD,
  database: process.env.PGDATABASE || DB_NAME,
  ssl:
    process.env.DB_SSL === "true"
      ? { rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== "false" }
      : false,
  max: Number(process.env.DB_MAX_POOL_SIZE) || 10,
  idleTimeoutMillis: Number(process.env.DB_IDLE_TIMEOUT_MS) || 30000,
  connectionTimeoutMillis: Number(process.env.DB_CONNECTION_TIMEOUT_MS) || 5000,
});

const connectDB = async () => {
  if (pool) return pool;
  pool = new Pool(buildPoolConfig());
  pool.on("error", (err) => {
    console.error("[postgres] Unexpected error on idle client:", err.message);
  });

  try {
    const client = await pool.connect();
    try {
      const { rows } = await client.query("SELECT version()");
      console.log(`[postgres] Connected check: ${rows[0].version.split(",")[0]}`);
    } finally {
      client.release();
    }
    return pool;
  } catch (err) {
    console.error("[postgres] Failed to connect:", err.message);
    await pool.end().catch(() => {});
    pool = undefined;
    process.exit(1);
  }
};

const closeDB = async () => {
  if (!pool) return;
  await pool.end();
  pool = undefined;
  console.log("[postgres] Pool has ended");
};

export { connectDB, closeDB };
export default connectDB;



























// import pg from "pg";
// import { DB_MAX_POOL_SIZE, DB_IDLE_TIMEOUT_MS, DB_CONNECTION_TIMEOUT_MS } from "../constants.js";

// const { Pool } = pg;
// let pool;
// const buildPoolConfig = () => {
//   const ssl =
//     process.env.DB_SSL === "true"
//       ? { rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== "false" }
//       : false;

//   if (process.env.DATABASE_URL) {
//     return {
//       connectionString: process.env.DATABASE_URL,
//       ssl,
//       max: DB_MAX_POOL_SIZE,
//       idleTimeoutMillis: DB_IDLE_TIMEOUT_MS,
//       connectionTimeoutMillis: DB_CONNECTION_TIMEOUT_MS,
//       application_name: process.env.APP_NAME || "nodeprojectwithsc",
//     };
//   }

//   return {
//     host: process.env.PGHOST || "localhost",
//     port: Number(process.env.PGPORT) || 5432,
//     user: process.env.PGUSER,
//     password: process.env.PGPASSWORD,
//     database: process.env.PGDATABASE,
//     ssl,
//     max: DB_MAX_POOL_SIZE,
//     idleTimeoutMillis: DB_IDLE_TIMEOUT_MS,
//     connectionTimeoutMillis: DB_CONNECTION_TIMEOUT_MS,
//     application_name: process.env.APP_NAME || "nodeprojectwithsc",
//   };
// };

// const connectDB = async ({ retries = 5, delayMs = 2000 } = {}) => {
//   if (pool) return pool;
//   pool = new Pool(buildPoolConfig());
//   pool.on("error", (err) => {
//     console.error("[postgres] Unexpected error on idle client:", err.message);
//   });

//   for (let attempt = 1; attempt <= retries; attempt++) {
//     try {
//       const client = await pool.connect();
//       try {
//         const { rows } = await client.query("SELECT version()");
//         console.log(`[postgres] Connected check: ${rows[0].version.split(",")[0]}`);
//       } finally {
//         client.release();
//       }
//       return pool;
//     } catch (err) {
//       console.error(`[postgres] Connection attempt ${attempt}/${retries} failed: ${err.message}`);
//       if (attempt === retries) {
//         await pool.end().catch(() => {});
//         pool = undefined;
//         throw err;
//       }
//       const wait = delayMs * 2 ** (attempt - 1);
//       await new Promise((resolve) => setTimeout(resolve, wait));
//     }
//   }
// };

// const query = (text, params) => {
//   if (!pool) throw new Error("Database not initialized. Call connectDB() first.");
//   return pool.query(text, params);
// };

// const withTransaction = async (callback) => {
//   if (!pool) throw new Error("Database not initialized. Call connectDB() first.");
//   const client = await pool.connect();
//   try {
//     await client.query("BEGIN");
//     const result = await callback(client);
//     await client.query("COMMIT");
//     return result;
//   } catch (err) {
//     await client.query("ROLLBACK").catch(() => {});
//     throw err;
//   } finally {
//     client.release();
//   }
// };

// const closeDB = async () => {
//   if (!pool) return;
//   await pool.end();
//   pool = undefined;
//   console.log("[postgres] Pool has ended");
// };

// export { connectDB, query, withTransaction, closeDB };
// export default connectDB;
