import { createClient } from "redis";

let redisClient;

export async function connectRedis() {
  const url = process.env.REDIS_URL;

  if (!url) {
    throw new Error("REDIS_URL is not configured");
  }

  redisClient = createClient({
    url
  });

  redisClient.on("error", (error) => {
    console.error("Redis connection error:", error.message);
  });

  await redisClient.connect();

  console.log("Redis connected");

  return redisClient;
}

export function getRedisClient() {
  if (!redisClient?.isReady) {
    throw new Error("Redis is not connected");
  }

  return redisClient;
}

export async function disconnectRedis() {
  if (redisClient?.isOpen) {
    await redisClient.quit();
  }
}