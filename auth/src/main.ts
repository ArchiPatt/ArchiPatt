import { buildApp } from "./server";
import { env } from "./env";

async function main() {
  const app = await buildApp();

  await app.listen({ port: env.port, host: "0.0.0.0" });
  app.log.info({ port: env.port, issuer: env.issuer }, "authHooks service started");
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
