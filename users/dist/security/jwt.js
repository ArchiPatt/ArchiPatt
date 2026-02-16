"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyBearerToken = verifyBearerToken;
exports.hasRole = hasRole;
const jose_1 = require("jose");
const env_1 = require("../env");
const jwks = (0, jose_1.createRemoteJWKSet)(new URL(`${env_1.env.auth.issuer}/jwks`));
async function verifyBearerToken(authorization) {
    if (!authorization?.startsWith("Bearer "))
        return null;
    const token = authorization.slice("Bearer ".length).trim();
    if (!token)
        return null;
    const { payload } = await (0, jose_1.jwtVerify)(token, jwks, {
        issuer: env_1.env.auth.issuer
    });
    return payload;
}
function hasRole(payload, role) {
    const roles = payload?.roles;
    return Array.isArray(roles) && roles.includes(role);
}
