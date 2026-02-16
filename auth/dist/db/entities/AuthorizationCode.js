"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthorizationCode = void 0;
const typeorm_1 = require("typeorm");
let AuthorizationCode = class AuthorizationCode {
    id;
    code;
    clientId;
    userId;
    redirectUri;
    scopes;
    codeChallenge;
    codeChallengeMethod;
    nonce;
    expiresAt;
    consumedAt;
    createdAt;
};
exports.AuthorizationCode = AuthorizationCode;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], AuthorizationCode.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)({ unique: true }),
    (0, typeorm_1.Column)({ type: "text" }),
    __metadata("design:type", String)
], AuthorizationCode.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: "client_id", type: "text" }),
    __metadata("design:type", String)
], AuthorizationCode.prototype, "clientId", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: "user_id", type: "uuid" }),
    __metadata("design:type", String)
], AuthorizationCode.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "redirect_uri", type: "text" }),
    __metadata("design:type", String)
], AuthorizationCode.prototype, "redirectUri", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", array: true }),
    __metadata("design:type", Array)
], AuthorizationCode.prototype, "scopes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "code_challenge", type: "text" }),
    __metadata("design:type", String)
], AuthorizationCode.prototype, "codeChallenge", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "code_challenge_method", type: "text" }),
    __metadata("design:type", String)
], AuthorizationCode.prototype, "codeChallengeMethod", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "nonce", type: "text", nullable: true }),
    __metadata("design:type", Object)
], AuthorizationCode.prototype, "nonce", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "expires_at", type: "timestamptz" }),
    __metadata("design:type", Date)
], AuthorizationCode.prototype, "expiresAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "consumed_at", type: "timestamptz", nullable: true }),
    __metadata("design:type", Object)
], AuthorizationCode.prototype, "consumedAt", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: "created_at", type: "timestamptz" }),
    __metadata("design:type", Date)
], AuthorizationCode.prototype, "createdAt", void 0);
exports.AuthorizationCode = AuthorizationCode = __decorate([
    (0, typeorm_1.Entity)({ name: "authorization_codes" })
], AuthorizationCode);
