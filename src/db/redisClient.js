// src/db/redisClient.js
import { createClient } from "redis";

let client;

export const getRedisClient = async () => {
  if (client && client.isOpen) return client;

  client = createClient({
    url: process.env.REDIS_URL || "redis://localhost:6379",
    socket: {
      reconnectStrategy: (retries) => {
        if (retries > 5) {
          console.error("[redis] Giving up after 5 reconnect attempts — is Redis running?");
          return new Error("Too many retries");
        }
        return Math.min(retries * 200, 2000); // backoff, capped at 2s
      },
    },
  });

  client.on("error", (err) => {
    console.error("[redis] Client error:", err?.code || err?.message || err);
  });

  if (!client.isOpen) {
    await client.connect();
    console.log("[redis] Connected");
  }

  return client;
};

export const closeRedis = async () => {
  if (client && client.isOpen) {
    await client.quit();
    client = undefined;
    console.log("[redis] Connection closed");
  }
};