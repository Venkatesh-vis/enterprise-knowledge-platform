import "server-only";

import fs from "node:fs";
import { mkdir, rename, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";

function resolveKey(key: string) {
  const root = path.resolve(process.env.DOCUMENT_STORAGE_DIR || path.join(process.cwd(), ".data", "documents"));
  const safe = key.replace(/\\/g, "/").replace(/^\/+/, "");
  const resolved = path.resolve(root, safe);
  if (resolved !== root && !resolved.startsWith(`${root}${path.sep}`)) {
    throw new Error("Invalid document storage key.");
  }
  return resolved;
}

export const documentStorage = {
  async save(key: string, data: Buffer) {
    const target = resolveKey(key);
    await mkdir(path.dirname(target), { recursive: true });
    const temp = `${target}.tmp-${process.pid}-${Date.now()}`;
    await writeFile(temp, data, { flag: "wx" });
    try {
      await rename(temp, target);
    } catch (error) {
      await rm(temp, { force: true });
      throw error;
    }
  },

  createReadStream(key: string) {
    return fs.createReadStream(resolveKey(key));
  },

  async remove(key: string) {
    await rm(resolveKey(key), { force: true });
  },

  async exists(key: string) {
    try {
      await stat(resolveKey(key));
      return true;
    } catch {
      return false;
    }
  },
};
