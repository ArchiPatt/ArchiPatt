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
exports.UserProfile = void 0;
const typeorm_1 = require("typeorm");
let UserProfile = class UserProfile {
    id;
    username;
    displayName;
    roles;
    isBlocked;
    createdAt;
    updatedAt;
};
exports.UserProfile = UserProfile;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], UserProfile.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)({ unique: true }),
    (0, typeorm_1.Column)({ type: "text" }),
    __metadata("design:type", String)
], UserProfile.prototype, "username", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "display_name", type: "text", nullable: true }),
    __metadata("design:type", Object)
], UserProfile.prototype, "displayName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", array: true, default: () => "ARRAY[]::text[]" }),
    __metadata("design:type", Array)
], UserProfile.prototype, "roles", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "is_blocked", type: "boolean", default: false }),
    __metadata("design:type", Boolean)
], UserProfile.prototype, "isBlocked", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: "created_at", type: "timestamptz" }),
    __metadata("design:type", Date)
], UserProfile.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: "updated_at", type: "timestamptz" }),
    __metadata("design:type", Date)
], UserProfile.prototype, "updatedAt", void 0);
exports.UserProfile = UserProfile = __decorate([
    (0, typeorm_1.Entity)({ name: "user_profiles" })
], UserProfile);
