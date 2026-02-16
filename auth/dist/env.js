"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv = __importStar(require("dotenv"));
dotenv.config();
function must(name) {
    const v = process.env[name];
    if (!v)
        throw new Error(`Missing env: ${name}`);
    return v;
}
function num(name, fallback) {
    const v = process.env[name];
    if (!v)
        return fallback;
    const n = Number(v);
    if (!Number.isFinite(n))
        throw new Error(`Env ${name} must be a number`);
    return n;
}
function list(name, fallback = []) {
    const v = process.env[name];
    if (!v)
        return fallback;
    return v
        .split(/[,\s]+/g)
        .map((s) => s.trim())
        .filter(Boolean);
}
exports.env = {
    nodeEnv: process.env.NODE_ENV ?? "development",
    port: num("PORT", 4000),
    issuer: process.env.ISSUER ?? `http://localhost:${num("PORT", 4000)}`,
    db: {
        host: process.env.DB_HOST ?? "localhost",
        port: num("DB_PORT", 5432),
        user: process.env.DB_USER ?? "auth",
        password: process.env.DB_PASSWORD ?? "auth",
        name: process.env.DB_NAME ?? "auth"
    },
    session: {
        cookieName: process.env.SESSION_COOKIE_NAME ?? "sid",
        ttlSeconds: num("SESSION_TTL_SECONDS", 60 * 60 * 24 * 7)
    },
    tokens: {
        accessTtlSeconds: num("ACCESS_TOKEN_TTL_SECONDS", 15 * 60),
        idTtlSeconds: num("ID_TOKEN_TTL_SECONDS", 15 * 60),
        refreshTtlSeconds: num("REFRESH_TOKEN_TTL_SECONDS", 60 * 60 * 24 * 30)
    },
    keys: {
        privateJwkJson: must("AUTH_PRIVATE_JWK_JSON")
    },
    usersService: {
        baseUrl: must("USERS_SERVICE_URL"),
        internalToken: must("USERS_INTERNAL_TOKEN")
    },
    seed: {
        adminUsername: process.env.SEED_ADMIN_USERNAME ?? "admin",
        adminPassword: process.env.SEED_ADMIN_PASSWORD ?? "admin",
        clientId: process.env.SEED_CLIENT_ID ?? "demo-client",
        clientSecret: process.env.SEED_CLIENT_SECRET ?? "demo-secret",
        clientRedirectUris: list("SEED_CLIENT_REDIRECT_URIS", ["http://localhost:5173/callback"]),
        clientScopes: list("SEED_CLIENT_SCOPES", ["openid", "profile", "roles"])
    }
};
