"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.issueAccessToken = issueAccessToken;
exports.issueIdToken = issueIdToken;
const jose_1 = require("jose");
const env_1 = require("../env");
const jwks_1 = require("./jwks");
async function issueAccessToken(claims) {
    const now = Math.floor(Date.now() / 1000);
    const privateKey = await (0, jwks_1.getPrivateKey)();
    return await new jose_1.SignJWT({
        roles: claims.roles,
        scope: claims.scope
    })
        .setProtectedHeader({ alg: "RS256", kid: "auth-default", typ: "JWT" })
        .setIssuer(env_1.env.issuer)
        .setAudience(claims.aud)
        .setSubject(claims.sub)
        .setIssuedAt(now)
        .setExpirationTime(now + env_1.env.tokens.accessTtlSeconds)
        .sign(privateKey);
}
async function issueIdToken(params) {
    const now = Math.floor(Date.now() / 1000);
    const privateKey = await (0, jwks_1.getPrivateKey)();
    const payload = {};
    if (params.nonce)
        payload.nonce = params.nonce;
    if (params.authTime)
        payload.auth_time = params.authTime;
    return await new jose_1.SignJWT(payload)
        .setProtectedHeader({ alg: "RS256", kid: "auth-default", typ: "JWT" })
        .setIssuer(env_1.env.issuer)
        .setAudience(params.aud)
        .setSubject(params.sub)
        .setIssuedAt(now)
        .setExpirationTime(now + env_1.env.tokens.idTtlSeconds)
        .sign(privateKey);
}
