"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPrivateKey = getPrivateKey;
exports.getJwks = getJwks;
const jose_1 = require("jose");
const env_1 = require("../env");
let cached = null;
async function loadKeys() {
    if (cached)
        return cached;
    const privateJwk = JSON.parse(env_1.env.keys.privateJwkJson);
    const privateKey = (await (0, jose_1.importJWK)(privateJwk, "RS256"));
    const publicJwk = await (0, jose_1.exportJWK)(privateKey);
    delete publicJwk.d;
    delete publicJwk.p;
    delete publicJwk.q;
    delete publicJwk.dp;
    delete publicJwk.dq;
    delete publicJwk.qi;
    if (!publicJwk.kid) {
        // If user generated JWK without kid, set a stable kid
        publicJwk.kid = "auth-default";
    }
    publicJwk.use = "sig";
    publicJwk.alg = "RS256";
    cached = { privateKey, publicJwk };
    return cached;
}
async function getPrivateKey() {
    const { privateKey } = await loadKeys();
    return privateKey;
}
async function getJwks() {
    const { publicJwk } = await loadKeys();
    return { keys: [publicJwk] };
}
