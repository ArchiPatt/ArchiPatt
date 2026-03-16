import { buildApp } from "./server";
import { env } from "./env";

async function main() {
  const app = await buildApp();
  await app.listen({ host: "0.0.0.0", port: env.port });
  app.log.info({ port: env.port }, "admin-settings service started");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
