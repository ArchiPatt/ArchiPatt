import { buildApp } from "./server";
import { env } from "./env";
import { startAccrualWorker } from "./workers/accrual";

async function main() {
  const app = await buildApp();
  const stopWorker = startAccrualWorker(app);
  app.addHook("onClose", async () => {
    stopWorker();
  });
  await app.listen({ host: "0.0.0.0", port: env.port });
  app.log.info({ port: env.port }, "credits service started");
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
