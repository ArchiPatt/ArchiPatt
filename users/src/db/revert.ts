import { initDataSource } from "./data-source";

async function run() {
  const ds = await initDataSource();
  await ds.undoLastMigration();
  await ds.destroy();
}

run().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});

