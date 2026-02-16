import { generateKeyPair, exportJWK } from "jose";

async function run() {
  const { privateKey } = await generateKeyPair("RS256", {
    modulusLength: 2048,
    extractable: true
  });
  const jwk = await exportJWK(privateKey);
  // eslint-disable-next-line no-console
  console.log(JSON.stringify({ ...jwk, kid: jwk.kid ?? "auth-default", use: "sig", alg: "RS256" }));
}

run().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});

