"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchUserProfileByUsername = fetchUserProfileByUsername;
const env_1 = require("../env");
async function fetchUserProfileByUsername(username) {
    const url = `${env_1.env.usersService.baseUrl}/internal/users/by-username/${encodeURIComponent(username)}`;
    const res = await fetch(url, {
        method: "GET",
        headers: {
            "x-internal-token": env_1.env.usersService.internalToken
        }
    });
    if (res.status === 404)
        return null;
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`users service error (${res.status}): ${text}`);
    }
    const data = (await res.json());
    return data;
}
