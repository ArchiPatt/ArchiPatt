"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerUserinfoRoutes = registerUserinfoRoutes;
const bearer_1 = require("../security/bearer");
function registerUserinfoRoutes(app) {
    app.get("/userinfo", async (req, reply) => {
        try {
            const payload = await (0, bearer_1.verifyAccessToken)(req.headers.authorization);
            if (!payload)
                return reply.code(401).send({ error: "unauthorized" });
            return {
                sub: payload.sub,
                roles: payload.roles,
                scope: payload.scope,
                iss: payload.iss,
                aud: payload.aud
            };
        }
        catch {
            return reply.code(401).send({ error: "unauthorized" });
        }
    });
}
