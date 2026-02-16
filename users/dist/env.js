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
function num(name, fallback) {
    const v = process.env[name];
    if (!v)
        return fallback;
    const n = Number(v);
    if (!Number.isFinite(n))
        throw new Error(`Env ${name} must be a number`);
    return n;
}
function must(name) {
    const v = process.env[name];
    if (!v)
        throw new Error(`Missing env: ${name}`);
    return v;
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
    port: num("PORT", 4001),
    auth: {
        issuer: must("AUTH_ISSUER")
    },
    internalToken: must("INTERNAL_TOKEN"),
    db: {
        host: process.env.DB_HOST ?? "localhost",
        port: num("DB_PORT", 5432),
        user: process.env.DB_USER ?? "users",
        password: process.env.DB_PASSWORD ?? "users",
        name: process.env.DB_NAME ?? "users"
    },
    seed: {
        adminUsername: process.env.SEED_ADMIN_USERNAME ?? "admin",
        adminRoles: list("SEED_ADMIN_ROLES", ["admin", "employee", "client"]),
        clientUsername: process.env.SEED_CLIENT_USERNAME ?? "client1",
        clientRoles: list("SEED_CLIENT_ROLES", ["client"])
    }
};
