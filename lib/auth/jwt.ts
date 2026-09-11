import "server-only";

import {SignJWT,jwtVerify,type JWTPayload,} from "jose";

const ISSUER = "enterprise-knowledge-platform";
const AUDIENCE = "enterprise-knowledge-web";

const ACCESS_TOKEN_TTL_SECONDS = 15 * 60;

export type AuthTokenPayload = JWTPayload & {
  userId: string;
  organizationId: string;
  membershipId: string;
  role: string;
};

function getSecretKey() {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not configured.");
  }

  return new TextEncoder().encode(secret);
}

export async function createAccessToken(input: {
  userId: string;
  organizationId: string;
  membershipId: string;
  role: string;
}) {
  const now = Math.floor(Date.now() / 1000);

  return new SignJWT({
    userId: input.userId,
    organizationId: input.organizationId,
    membershipId: input.membershipId,
    role: input.role,
  })
    .setProtectedHeader({
      alg: "HS256",
      typ: "JWT",
    })
    .setSubject(input.userId)
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setIssuedAt(now)
    .setExpirationTime(now + ACCESS_TOKEN_TTL_SECONDS,)
    .sign(getSecretKey());
}

export async function verifyAccessToken(
  token: string,
): Promise<AuthTokenPayload> {
  const { payload } =
    await jwtVerify<AuthTokenPayload>(
      token,
      getSecretKey(),
      {
        algorithms: ["HS256"],
        issuer: ISSUER,
        audience: AUDIENCE,
      },
    );

  if (
    typeof payload.userId !== "string" ||
    typeof payload.organizationId !== "string" ||
    typeof payload.membershipId !== "string" ||
    typeof payload.role !== "string"
  ) {
    throw new Error(
      "Authentication token contains invalid claims.",
    );
  }

  return payload;
}