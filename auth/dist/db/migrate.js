"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const data_source_1 = require("./data-source");
async function run() {
    const ds = await (0, data_source_1.initDataSource)();
    await ds.runMigrations();
    await ds.destroy();
}
run().catch((err) => {
    // eslint-disable-next-line no-console
    console.error(err);
    process.exit(1);
});
