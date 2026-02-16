"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedInitialData = seedInitialData;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const env_1 = require("../env");
const User_1 = require("../db/entities/User");
const OAuthClient_1 = require("../db/entities/OAuthClient");
async function seedInitialData(ds) {
    await seedAdmin(ds);
    await seedClient(ds);
}
async function seedAdmin(ds) {
    const repo = ds.getRepository(User_1.User);
    const existing = await repo.findOne({ where: { username: env_1.env.seed.adminUsername } });
    if (existing)
        return;
    const passwordHash = await bcryptjs_1.default.hash(env_1.env.seed.adminPassword, 12);
    const user = repo.create({
        username: env_1.env.seed.adminUsername,
        passwordHash
    });
    await repo.save(user);
}
async function seedClient(ds) {
    const repo = ds.getRepository(OAuthClient_1.OAuthClient);
    const existing = await repo.findOne({ where: { clientId: env_1.env.seed.clientId } });
    if (existing)
        return;
    const clientSecretHash = env_1.env.seed.clientSecret ? await bcryptjs_1.default.hash(env_1.env.seed.clientSecret, 12) : null;
    const client = repo.create({
        clientId: env_1.env.seed.clientId,
        clientSecretHash,
        redirectUris: env_1.env.seed.clientRedirectUris,
        allowedScopes: env_1.env.seed.clientScopes
    });
    await repo.save(client);
}
