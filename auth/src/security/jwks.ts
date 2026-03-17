import { importJWK, JWK, CryptoKey, KeyObject } from "jose";
import { env } from "../env";

type SigningKey = CryptoKey | KeyObject;

let cached: { privateKey: SigningKey; publicJwk: JWK } | null = null;

async function loadKeys(): Promise<{ privateKey: SigningKey; publicJwk: JWK }> {
  if (cached) return cached;

  const privateJwk = JSON.parse(env.keys.privateJwkJson) as JWK;
  const privateKey = (await importJWK(privateJwk, "RS256")) as SigningKey;

  const {
    n,
    e,
    kty,
    kid,
    use,
    alg,
  } = privateJwk as JWK & {
    n?: string;
    e?: string;
    kty?: string;
    kid?: string;
    use?: string;
    alg?: string;
  };

  if (!kty || !n || !e) {
    throw new Error("AUTH_PRIVATE_JWK_JSON must contain RSA public fields kty,n,e");
  }

  const publicJwk: JWK = { kty, n, e };
  if (kid) publicJwk.kid = kid;
  if (use) publicJwk.use = use;
  if (alg) publicJwk.alg = alg;

  if (!publicJwk.kid) {
    // If userHooks generated JWK without kid, set a stable kid
    publicJwk.kid = "authHooks-default";
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
