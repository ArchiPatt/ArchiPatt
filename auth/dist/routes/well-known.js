"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerWellKnownRoutes = registerWellKnownRoutes;
const env_1 = require("../env");
const jwks_1 = require("../security/jwks");
function registerWellKnownRoutes(app) {
    app.get("/.well-known/openid-configuration", async () => {
        return {
            issuer: env_1.env.issuer,
            authorization_endpoint: `${env_1.env.issuer}/authorize`,
            token_endpoint: `${env_1.env.issuer}/token`,
            userinfo_endpoint: `${env_1.env.issuer}/userinfo`,
            jwks_uri: `${env_1.env.issuer}/jwks`,
            response_types_supported: ["code"],
            grant_types_supported: ["authorization_code", "refresh_token", "client_credentials"],
            subject_types_supported: ["public"],
            id_token_signing_alg_values_supported: ["RS256"],
            code_challenge_methods_supported: ["S256"]
        };
    });
    app.get("/jwks", async () => {
        return (0, jwks_1.getJwks)();
    });
}
