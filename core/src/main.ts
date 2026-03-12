import { buildApp } from "./server";
import { env } from "./env";
import { startOperationConsumer } from "./messaging";

async function main() {
  const app = await buildApp();
  await app.listen({ host: "0.0.0.0", port: env.port });
  await startOperationConsumer(app.db);
  app.log.info({ port: env.port }, "core service started");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
