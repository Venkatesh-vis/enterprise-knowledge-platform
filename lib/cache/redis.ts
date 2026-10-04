import "server-only";

type RedisResponse<T> = {
  result?: T;
  error?: string;
};

function getRedisConfig() {
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();

  if (!url || !token) {
    return null;
  }

  return { url: url.replace(/\/$/, ""), token };
}

async function command<T>(parts: Array<string | number>) {
  const config = getRedisConfig();

  if (!config) {
    return null;
  }

  try {
    const response = await fetch(config.url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(parts),
      cache: "no-store",
    });

    if (!response.ok) {
      console.error(`Redis command failed with status ${response.status}.`);
      return null;
    }

    const payload = (await response.json()) as RedisResponse<T>;

    if (payload.error) {
      console.error(`Redis command failed: ${payload.error}`);
      return null;
    }

    return payload.result ?? null;
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

  if (!value) {
    return null;
  }

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

export async function incrementRedisCounter(key: string, ttlSeconds: number) {
  const count = await command<number>(["INCR", key]);

  if (count === null) {
    return null;
  }

  if (count === 1) {
    await command(["EXPIRE", key, ttlSeconds]);
  }

  return count;
}
