import { NextResponse } from "next/server";

import { createRedisKey, incrementRedisCounter } from "@/lib/cache/redis";

type RateLimitOptions = {
  limit: number;
  windowSeconds: number;
  keyPrefix: string;
};

function getClientIdentifier(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  return forwardedFor?.split(",")[0]?.trim() || realIp?.trim() || "unknown";
}

export async function checkApiRateLimit(
  request: Request,
  options: RateLimitOptions,
) {
  const identifier = getClientIdentifier(request);
  const key = createRedisKey(
    "rate-limit",
    options.keyPrefix,
    identifier,
  );
  const count = await incrementRedisCounter(key, options.windowSeconds);

  // Redis is an optimization and a distributed coordination layer, not a
  // hard dependency for application availability. If it is unavailable,
  // continue with the request and let the database/application safeguards run.
  if (count === null) {
    return null;
  }

  if (count <= options.limit) {
    return null;
  }

  return NextResponse.json(
    {
      success: false,
      message: "Too many requests. Please try again later.",
    },
    {
      status: 429,
      headers: {
        "Cache-Control": "no-store",
        "Retry-After": String(options.windowSeconds),
      },
    },
  );
}
