import { createHash, randomBytes } from "node:crypto";

export function createInterviewToken() {
  const token = randomBytes(32).toString("base64url");
  return { token, tokenHash: hashInterviewToken(token) };
}

export function hashInterviewToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}
