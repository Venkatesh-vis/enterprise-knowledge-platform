import "server-only";

import { createHash, createHmac } from "node:crypto";

const SERVICE = "s3";

type S3Config = {
  region: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
  sessionToken?: string;
  endpoint?: string;
  forcePathStyle: boolean;
};

export class DocumentStorageError extends Error {
  status: number;

  constructor(message: string, status = 500) {
    super(message);
    this.name = "DocumentStorageError";
    this.status = status;
  }
}

function getConfig(): S3Config {
  const region = process.env.AWS_REGION?.trim();
  const bucket = process.env.AWS_S3_BUCKET_NAME?.trim();
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID?.trim();
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY?.trim();

  if (!region || !bucket || !accessKeyId || !secretAccessKey) {
    throw new DocumentStorageError(
      "S3 storage is not configured. Set AWS_REGION, AWS_S3_BUCKET_NAME, AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY.",
    );
  }

  return {
    region,
    bucket,
    accessKeyId,
    secretAccessKey,
    sessionToken: process.env.AWS_SESSION_TOKEN?.trim() || undefined,
    endpoint: process.env.AWS_S3_ENDPOINT?.trim() || undefined,
    forcePathStyle: process.env.AWS_S3_FORCE_PATH_STYLE === "true",
  };
}

function sha256(value: string | Buffer) {
  return createHash("sha256").update(value).digest("hex");
}

function hmac(key: string | Buffer, value: string) {
  return createHmac("sha256", key).update(value).digest();
}

function encodeKey(key: string) {
  return key
    .replace(/\\/g, "/")
    .split("/")
    .map(encodeURIComponent)
    .join("/");
}

function createRequestUrl(config: S3Config, key: string) {
  const encodedKey = encodeKey(key);

  if (!config.endpoint) {
    return new URL(
      `https://${config.bucket}.s3.${config.region}.amazonaws.com/${encodedKey}`,
    );
  }

  const url = new URL(config.endpoint);
  const basePath = url.pathname.replace(/\/$/, "");

  if (config.forcePathStyle) {
    url.pathname = `${basePath}/${config.bucket}/${encodedKey}`;
    return url;
  }

  url.hostname = `${config.bucket}.${url.hostname}`;
  url.pathname = `${basePath}/${encodedKey}`;
  return url;
}

function createSigningKey(secret: string, date: string, region: string) {
  const dateKey = hmac(`AWS4${secret}`, date);
  const regionKey = hmac(dateKey, region);
  const serviceKey = hmac(regionKey, SERVICE);
  return hmac(serviceKey, "aws4_request");
}

async function requestS3(
  method: "GET" | "PUT" | "HEAD" | "DELETE",
  key: string,
  body?: Buffer,
  contentType?: string,
) {
  const config = getConfig();
  const url = createRequestUrl(config, key);
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
  const date = amzDate.slice(0, 8);
  const payloadHash = sha256(body ?? "");

  const headers: Record<string, string> = {
    host: url.host,
    "x-amz-content-sha256": payloadHash,
    "x-amz-date": amzDate,
  };

  if (contentType) headers["content-type"] = contentType;
  if (config.sessionToken) {
    headers["x-amz-security-token"] = config.sessionToken;
  }

  const signedHeaders = Object.keys(headers).sort();
  const canonicalHeaders = signedHeaders
    .map((name) => `${name}:${headers[name].trim()}\n`)
    .join("");
  const signedHeaderValue = signedHeaders.join(";");
  const canonicalRequest = [
    method,
    url.pathname || "/",
    url.search.slice(1),
    canonicalHeaders,
    signedHeaderValue,
    payloadHash,
  ].join("\n");

  const credentialScope = `${date}/${config.region}/${SERVICE}/aws4_request`;
  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amzDate,
    credentialScope,
    sha256(canonicalRequest),
  ].join("\n");

  const signature = hmac(
    createSigningKey(config.secretAccessKey, date, config.region),
    stringToSign,
  ).toString("hex");

  const authorization =
    `AWS4-HMAC-SHA256 Credential=${config.accessKeyId}/${credentialScope}, ` +
    `SignedHeaders=${signedHeaderValue}, Signature=${signature}`;

  const requestHeaders = new Headers(headers);
  requestHeaders.set("Authorization", authorization);

  return fetch(url, {
    method,
    headers: requestHeaders,
    body,
    cache: "no-store",
  });
}

function assertKey(key: string) {
  if (!key || key.startsWith("/") || key.includes("\\0")) {
    throw new DocumentStorageError("Invalid document storage key.", 400);
  }
}

export const documentStorage = {
  async save(key: string, data: Buffer, contentType = "application/octet-stream") {
    assertKey(key);
    const response = await requestS3("PUT", key, data, contentType);

    if (!response.ok) {
      const details = await response.text();
      console.error("S3 upload failed:", details);
      throw new DocumentStorageError("The document could not be uploaded to S3.");
    }
  },

  async createReadStream(key: string) {
    assertKey(key);
    const response = await requestS3("GET", key);

    if (response.status === 404) {
      throw new DocumentStorageError("Document file is unavailable.", 410);
    }

    if (!response.ok || !response.body) {
      throw new DocumentStorageError("The document file could not be downloaded.");
    }

    return response.body;
  },

  async remove(key: string) {
    assertKey(key);
    const response = await requestS3("DELETE", key);

    if (!response.ok && response.status !== 404) {
      const details = await response.text();
      console.error("S3 delete failed:", details);
      throw new DocumentStorageError("The document file could not be removed from S3.");
    }
  },

  async exists(key: string) {
    assertKey(key);
    const response = await requestS3("HEAD", key);

    if (response.status === 404) return false;

    if (!response.ok) {
      throw new DocumentStorageError("The document file could not be checked in S3.");
    }

    return true;
  },
};
