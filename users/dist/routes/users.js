"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerUsersRoutes = registerUsersRoutes;
const UserProfile_1 = require("../db/entities/UserProfile");
const env_1 = require("../env");
const jwt_1 = require("../security/jwt");
function normalizeRoles(roles) {
    if (!Array.isArray(roles))
        return [];
    return [...new Set(roles.map((r) => r.trim()).filter(Boolean))];
}
function canManage(payload) {
    return (0, jwt_1.hasRole)(payload, "employee") || (0, jwt_1.hasRole)(payload, "admin");
}
function registerUsersRoutes(app) {
    app.get("/internal/users/by-username/:username", async (req, reply) => {
        const token = req.headers["x-internal-token"];
        if (token !== env_1.env.internalToken) {
            return reply.code(401).send({ error: "unauthorized" });
        }
        const username = req.params.username?.trim();
        if (!username)
            return reply.code(400).send({ error: "username_required" });
        const user = await app.db.getRepository(UserProfile_1.UserProfile).findOne({ where: { username } });
        if (!user)
            return reply.code(404).send({ error: "not_found" });
        return {
            id: user.id,
            username: user.username,
            roles: user.roles,
            isBlocked: user.isBlocked
        };
    });
    app.get("/me", async (req, reply) => {
        try {
            const payload = await (0, jwt_1.verifyBearerToken)(req.headers.authorization);
            if (!payload?.sub)
                return reply.code(401).send({ error: "unauthorized" });
            const user = await app.db.getRepository(UserProfile_1.UserProfile).findOne({ where: { id: String(payload.sub) } });
            if (!user)
                return reply.code(404).send({ error: "not_found" });
            return {
                id: user.id,
                username: user.username,
                displayName: user.displayName,
                roles: user.roles,
                isBlocked: user.isBlocked
            };
        }
        catch {
            return reply.code(401).send({ error: "unauthorized" });
        }
    });
    app.get("/users", async (req, reply) => {
        try {
            const payload = await (0, jwt_1.verifyBearerToken)(req.headers.authorization);
            if (!payload || !canManage(payload))
                return reply.code(403).send({ error: "forbidden" });
            const rows = await app.db.getRepository(UserProfile_1.UserProfile).find({ order: { createdAt: "DESC" } });
            return rows.map((u) => ({
                id: u.id,
                username: u.username,
                displayName: u.displayName,
                roles: u.roles,
                isBlocked: u.isBlocked,
                createdAt: u.createdAt
            }));
        }
        catch {
            return reply.code(401).send({ error: "unauthorized" });
        }
    });
    app.get("/users/:id", async (req, reply) => {
        try {
            const payload = await (0, jwt_1.verifyBearerToken)(req.headers.authorization);
            if (!payload || !canManage(payload))
                return reply.code(403).send({ error: "forbidden" });
            const id = req.params.id;
            const user = await app.db.getRepository(UserProfile_1.UserProfile).findOne({ where: { id } });
            if (!user)
                return reply.code(404).send({ error: "not_found" });
            return {
                id: user.id,
                username: user.username,
                displayName: user.displayName,
                roles: user.roles,
                isBlocked: user.isBlocked
            };
        }
        catch {
            return reply.code(401).send({ error: "unauthorized" });
        }
    });
    app.post("/users", async (req, reply) => {
        try {
            const payload = await (0, jwt_1.verifyBearerToken)(req.headers.authorization);
            if (!payload || !canManage(payload))
                return reply.code(403).send({ error: "forbidden" });
            const username = req.body?.username?.trim();
            if (!username)
                return reply.code(400).send({ error: "username_required" });
            const roles = normalizeRoles(req.body?.roles);
            if (!roles.length)
                return reply.code(400).send({ error: "roles_required" });
            const repo = app.db.getRepository(UserProfile_1.UserProfile);
            const exists = await repo.findOne({ where: { username } });
            if (exists)
                return reply.code(409).send({ error: "username_exists" });
            const user = await repo.save(repo.create({
                username,
                displayName: req.body?.displayName?.trim() || null,
                roles,
                isBlocked: false
            }));
            return reply.code(201).send({
                id: user.id,
                username: user.username,
                displayName: user.displayName,
                roles: user.roles,
                isBlocked: user.isBlocked
            });
        }
        catch {
            return reply.code(401).send({ error: "unauthorized" });
        }
    });
    app.patch("/users/:id/block", async (req, reply) => {
        try {
            const payload = await (0, jwt_1.verifyBearerToken)(req.headers.authorization);
            if (!payload || !canManage(payload))
                return reply.code(403).send({ error: "forbidden" });
            const id = req.params.id;
            const isBlocked = req.body?.isBlocked;
            if (typeof isBlocked !== "boolean")
                return reply.code(400).send({ error: "isBlocked_boolean_required" });
            const repo = app.db.getRepository(UserProfile_1.UserProfile);
            const user = await repo.findOne({ where: { id } });
            if (!user)
                return reply.code(404).send({ error: "not_found" });
            user.isBlocked = isBlocked;
            await repo.save(user);
            return {
                id: user.id,
                username: user.username,
                isBlocked: user.isBlocked
            };
        }
        catch {
            return reply.code(401).send({ error: "unauthorized" });
        }
    });
}
