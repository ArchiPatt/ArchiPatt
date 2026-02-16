"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyPkceS256 = verifyPkceS256;
const crypto_1 = require("crypto");
function verifyPkceS256(codeVerifier, expectedChallenge) {
    const digest = (0, crypto_1.createHash)("sha256").update(codeVerifier).digest();
    const challenge = base64UrlEncode(digest);
    return safeEqual(challenge, expectedChallenge);
}
function base64UrlEncode(buf) {
    return buf
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/g, "");
}
function safeEqual(a, b) {
    const aBuf = Buffer.from(a);
    const bBuf = Buffer.from(b);
    if (aBuf.length !== bBuf.length)
        return false;
    return (0, crypto_1.timingSafeEqual)(aBuf, bBuf);
}
