import { createClient } from "redis";

type RedisClient = ReturnType<typeof createClient>;

declare global {
  var redisPromise: Promise<RedisClient> | undefined;
}

if (!process.env.REDIS_URL) {
  throw new Error("REDIS_URL environment variable is not defined");
}

const createRedisClient = (): RedisClient => {
  const client = createClient({
    url: process.env.REDIS_URL,
  });

  client.on("error", (err) => {
    console.error("Redis Client Error:", err);
    if (!client.isOpen) {
      global.redisPromise = undefined; // allow re-initialization
    }
  });

  return client;
};

export async function getRedisClient(): Promise<RedisClient> {
  if (!global.redisPromise) {
    global.redisPromise = (async () => {
      const client = createRedisClient();
      await client.connect();
      return client;
    })();
  }
  return global.redisPromise;
}