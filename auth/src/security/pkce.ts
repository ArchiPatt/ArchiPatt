import { createHash, timingSafeEqual } from "crypto";

export function verifyPkceS256(
  codeVerifier: string,
  expectedChallenge: string,
): boolean {
  const digest = createHash("sha256").update(codeVerifier).digest();
  const challenge = base64UrlEncode(digest);
  return safeEqual(challenge, expectedChallenge);
}

function base64UrlEncode(buf: Buffer): string {
  return buf
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function safeEqual(a: string, b: string): boolean {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return timingSafeEqual(aBuf, bBuf);
}
