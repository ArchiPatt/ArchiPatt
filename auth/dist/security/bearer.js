"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyAccessToken = verifyAccessToken;
const jose_1 = require("jose");
const env_1 = require("../env");
const jwks = (0, jose_1.createRemoteJWKSet)(new URL(`${env_1.env.issuer}/jwks`));
async function verifyAccessToken(authorizationHeader) {
    if (!authorizationHeader?.startsWith("Bearer ")) {
        return null;
    }
    const token = authorizationHeader.slice("Bearer ".length).trim();
    if (!token)
        return null;
    const { payload } = await (0, jose_1.jwtVerify)(token, jwks, {
        issuer: env_1.env.issuer
    });
    return payload;
}
