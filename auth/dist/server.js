"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildApp = buildApp;
const fastify_1 = __importDefault(require("fastify"));
const cookie_1 = __importDefault(require("@fastify/cookie"));
const formbody_1 = __importDefault(require("@fastify/formbody"));
const static_1 = __importDefault(require("@fastify/static"));
const path_1 = __importDefault(require("path"));
const env_1 = require("./env");
const data_source_1 = require("./db/data-source");
const auth_1 = require("./routes/auth");
const docs_1 = require("./routes/docs");
const seed_1 = require("./bootstrap/seed");
async function buildApp() {
    const app = (0, fastify_1.default)({
        logger: {
            level: env_1.env.nodeEnv === "development" ? "info" : "info"
        }
    });
    await app.register(cookie_1.default, {
        hook: "onRequest"
    });
    await app.register(formbody_1.default);
    await app.register(static_1.default, {
        root: path_1.default.join(process.cwd(), "node_modules", "swagger-ui-dist"),
        prefix: "/swagger-static/"
    });
    const ds = await (0, data_source_1.initDataSource)();
    await ds.runMigrations();
    await (0, seed_1.seedInitialData)(ds);
    app.decorate("db", ds);
    (0, docs_1.registerDocsRoutes)(app);
    (0, auth_1.registerAuthRoutes)(app);
    app.get("/health", async () => ({ ok: true }));
    return app;
}
