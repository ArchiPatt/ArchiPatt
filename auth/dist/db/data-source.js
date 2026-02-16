"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
exports.initDataSource = initDataSource;
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const path_1 = __importDefault(require("path"));
const env_1 = require("../env");
const User_1 = require("./entities/User");
const OAuthClient_1 = require("./entities/OAuthClient");
const Session_1 = require("./entities/Session");
const AuthorizationCode_1 = require("./entities/AuthorizationCode");
const RefreshToken_1 = require("./entities/RefreshToken");
exports.AppDataSource = new typeorm_1.DataSource({
    type: "postgres",
    host: env_1.env.db.host,
    port: env_1.env.db.port,
    username: env_1.env.db.user,
    password: env_1.env.db.password,
    database: env_1.env.db.name,
    entities: [User_1.User, OAuthClient_1.OAuthClient, Session_1.Session, AuthorizationCode_1.AuthorizationCode, RefreshToken_1.RefreshToken],
    migrations: [path_1.default.join(__dirname, "migrations/*.{ts,js}")],
    synchronize: false,
    logging: false
});
async function initDataSource() {
    if (exports.AppDataSource.isInitialized)
        return exports.AppDataSource;
    await exports.AppDataSource.initialize();
    return exports.AppDataSource;
}
