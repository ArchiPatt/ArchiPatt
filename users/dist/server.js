"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildApp = buildApp;
const fastify_1 = __importDefault(require("fastify"));
const formbody_1 = __importDefault(require("@fastify/formbody"));
const env_1 = require("./env");
const data_source_1 = require("./db/data-source");
const seed_1 = require("./bootstrap/seed");
const users_1 = require("./routes/users");
async function buildApp() {
    const app = (0, fastify_1.default)({
        logger: {
            level: env_1.env.nodeEnv === "development" ? "info" : "info"
        }
    });
    await app.register(formbody_1.default);
    const ds = await (0, data_source_1.initDataSource)();
    await ds.runMigrations();
    await (0, seed_1.seedInitialUsers)(ds);
    app.decorate("db", ds);
    (0, users_1.registerUsersRoutes)(app);
    app.get("/health", async () => ({ ok: true }));
    return app;
}
