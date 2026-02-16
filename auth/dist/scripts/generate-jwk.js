"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jose_1 = require("jose");
async function run() {
    const { privateKey } = await (0, jose_1.generateKeyPair)("RS256", {
        modulusLength: 2048,
        extractable: true
    });
    const jwk = await (0, jose_1.exportJWK)(privateKey);
    // eslint-disable-next-line no-console
    console.log(JSON.stringify({ ...jwk, kid: jwk.kid ?? "auth-default", use: "sig", alg: "RS256" }));
}
run().catch((err) => {
    // eslint-disable-next-line no-console
    console.error(err);
    process.exit(1);
});
