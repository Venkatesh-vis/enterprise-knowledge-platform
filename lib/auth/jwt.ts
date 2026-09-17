import "server-only";

import {SignJWT,jwtVerify,type JWTPayload,} from "jose";

const JWT_ISSUER = "enterprise-knowledge-platform";

const JWT_AUDIENCE = "enterprise-knowledge-web";

const ACCESS_TOKEN_TTL = "15m";

type AuthTokenClaims =
  JWTPayload & {
    sub: string;
  };

function getSecretKey() {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error(
      "JWT_SECRET is not configured.",
    );
  }

  return new TextEncoder().encode(
    secret,
  );
}

export async function createAccessToken(
  userId: string,
) {
  return new SignJWT({})
    .setProtectedHeader({
      alg: "HS256",
      typ: "JWT",
    })
    .setSubject(userId)
    .setIssuer(JWT_ISSUER)
    .setAudience(JWT_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(
      ACCESS_TOKEN_TTL,
    )
    .sign(getSecretKey());
}

export async function verifyAccessToken(
  token: string,
) {
  const { payload } =
    await jwtVerify<AuthTokenClaims>(
      token,
      getSecretKey(),
      {
        algorithms: ["HS256"],
        issuer: JWT_ISSUER,
        audience: JWT_AUDIENCE,
      },
    );

  if (
    typeof payload.sub !==
    "string"
  ) {
    throw new Error(
      "Invalid authentication token.",
    );
  }

  return payload;
}