import dotenv from "dotenv";
import app from "./app.js";
import { connectDB, closeDB } from "./db/index.js";
dotenv.config({ path: "./.env" });
const PORT = Number(process.env.PORT) || 8000;

const startServer = async () => {
  try {
    await connectDB();

    const server = app.listen(PORT, () => {
      console.log(`[server] Listening on port ${PORT}`);
    });
    const shutdown = async (signal) => {
      console.log(`[server] ${signal} received, shutting down...`);
      server.close(async () => {
        await closeDB();
        process.exit(0);
      }); 
      setTimeout(() => process.exit(1), 10000).unref();
    };

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
  } catch (err) {
    console.error("[server] Failed to start:", err.message);
    process.exit(1);
  }
};

startServer();
