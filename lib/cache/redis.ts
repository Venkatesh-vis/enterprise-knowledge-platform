import "server-only";

import axios, { type AxiosInstance } from "axios";

type RedisResponse<T> = {
  result?: T;
  error?: string;
};

let redisClient: AxiosInstance | null = null;

function getRedisClient() {
  if (redisClient) return redisClient;

  const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();

  if (!url || !token) return null;

  redisClient = axios.create({
    baseURL: url.replace(/\/$/, ""),
    timeout: 5000,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  return redisClient;
}

async function command<T>(parts: Array<string | number>) {
  const client = getRedisClient();
  if (!client) return null;

  try {
    const { data } = await client.post<RedisResponse<T>>("", parts);

    if (data.error) {
      console.error(`Redis command failed: ${data.error}`);
      return null;
    }

    return data.result ?? null;
  } catch (error) {
    console.error("Redis request failed:", error);
    return null;
  }
}

export function createRedisKey(...parts: string[]) {
  return ["ekp", ...parts.map((part) => encodeURIComponent(part))].join(":");
}

export async function getRedisJson<T>(key: string) {
  const value = await command<string | null>(["GET", key]);
  if (!value) return null;

  try {
    return JSON.parse(value) as T;
  } catch {
    await deleteRedisKey(key);
    return null;
  }
}

export async function setRedisJson(
  key: string,
  value: unknown,
  ttlSeconds: number,
) {
  await command(["SET", key, JSON.stringify(value), "EX", ttlSeconds]);
}

export async function deleteRedisKey(key: string) {
  await command(["DEL", key]);
}

export async function invalidateRedisKeys(...keys: string[]) {
  const uniqueKeys = [...new Set(keys)];
  await Promise.all(uniqueKeys.map(deleteRedisKey));
}

export async function incrementRedisCounter(key: string, ttlSeconds: number) {
  const count = await command<number>(["INCR", key]);
  if (count === null) return null;
  if (count === 1) await command(["EXPIRE", key, ttlSeconds]);
  return count;
}

export const redisKeys = {
  authSnapshot: (userId: string) => createRedisKey("auth", "snapshot", userId),
  billingPlans: () => createRedisKey("billing", "plans"),
  workspaceOverview: (organizationId: string) =>
    createRedisKey("workspace", "overview", organizationId),
  rateLimit: (prefix: string, identifier: string) =>
    createRedisKey("rate-limit", prefix, identifier),
};
