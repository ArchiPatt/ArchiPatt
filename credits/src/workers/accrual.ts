import { FastifyInstance } from "fastify";
import { env } from "../env";
import { accrueDueCredits } from "../routes/credits";

export function startAccrualWorker(app: FastifyInstance): () => void {
  if (!env.accrualWorker.enabled) {
    app.log.info("accrual worker is disabled");
    return () => {};
  }

  const intervalMs = Math.max(1, env.accrualWorker.intervalSeconds) * 1000;
  let inProgress = false;

  const timer = setInterval(async () => {
    if (inProgress) return;
    inProgress = true;
    try {
      const result = await accrueDueCredits(app.db);
      if (result.processedCredits > 0 || result.accrualsCreated > 0) {
        app.log.info({ result }, "accrual worker cycle applied");
      }
    } catch (err) {
      app.log.error({ err }, "accrual worker cycle failed");
    } finally {
      inProgress = false;
    }
  }, intervalMs);

  app.log.info(
    { intervalSeconds: env.accrualWorker.intervalSeconds },
    "accrual worker started"
  );

  return () => clearInterval(timer);
}
