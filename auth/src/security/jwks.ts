import { exportJWK, importJWK, JWK, CryptoKey, KeyObject } from "jose";
import { env } from "../env";

type SigningKey = CryptoKey | KeyObject;

let cached: { privateKey: SigningKey; publicJwk: JWK } | null = null;

async function loadKeys(): Promise<{ privateKey: SigningKey; publicJwk: JWK }> {
  if (cached) return cached;

  const privateJwk = JSON.parse(env.keys.privateJwkJson) as JWK;
  const privateKey = (await importJWK(privateJwk, "RS256")) as SigningKey;

  const publicJwk = await exportJWK(privateKey);
  delete (publicJwk as any).d;
  delete (publicJwk as any).p;
  delete (publicJwk as any).q;
  delete (publicJwk as any).dp;
  delete (publicJwk as any).dq;
  delete (publicJwk as any).qi;

  if (!publicJwk.kid) {
    // If user generated JWK without kid, set a stable kid
    publicJwk.kid = "auth-default";
  }
  publicJwk.use = "sig";
  publicJwk.alg = "RS256";

  cached = { privateKey, publicJwk };
  return cached;
}

export async function getPrivateKey(): Promise<SigningKey> {
  const { privateKey } = await loadKeys();
  return privateKey;
}

export async function getJwks(): Promise<{ keys: JWK[] }> {
  const { publicJwk } = await loadKeys();
  return { keys: [publicJwk] };
}
