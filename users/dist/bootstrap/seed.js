"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedInitialUsers = seedInitialUsers;
const env_1 = require("../env");
const UserProfile_1 = require("../db/entities/UserProfile");
async function seedInitialUsers(ds) {
    const repo = ds.getRepository(UserProfile_1.UserProfile);
    const admin = await repo.findOne({ where: { username: env_1.env.seed.adminUsername } });
    if (!admin) {
        await repo.save(repo.create({
            username: env_1.env.seed.adminUsername,
            displayName: "Administrator",
            roles: env_1.env.seed.adminRoles,
            isBlocked: false
        }));
    }
    const client = await repo.findOne({ where: { username: env_1.env.seed.clientUsername } });
    if (!client) {
        await repo.save(repo.create({
            username: env_1.env.seed.clientUsername,
            displayName: "Client",
            roles: env_1.env.seed.clientRoles,
            isBlocked: false
        }));
    }
}
