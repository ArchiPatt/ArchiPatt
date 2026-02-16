"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = require("./server");
const env_1 = require("./env");
async function main() {
    const app = await (0, server_1.buildApp)();
    await app.listen({ host: "0.0.0.0", port: env_1.env.port });
    app.log.info({ port: env_1.env.port }, "users service started");
}
main().catch((err) => {
    // eslint-disable-next-line no-console
    console.error(err);
    process.exit(1);
});
