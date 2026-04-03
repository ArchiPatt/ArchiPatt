import type { FastifyInstance, FastifyRequest } from "fastify";

/** Нечётные минуты часа — 30% 500; чётные — 70% (независимо на каждый запрос). */
const FAILURE_RATE_ODD_MINUTE = 0.3;
const FAILURE_RATE_EVEN_MINUTE = 0.7;

function failureProbability(): number {
  const minute = new Date().getMinutes();
  return minute % 2 === 0 ? FAILURE_RATE_EVEN_MINUTE : FAILURE_RATE_ODD_MINUTE;
}

function requestPath(req: FastifyRequest): string {
  return (req.raw.url ?? "").split("?")[0] ?? "";
}

function skipSimulatedFailure(path: string): boolean {
  if (path === "/health") return true;
  if (path === "/swagger" || path === "/swagger.yml") return true;
  if (path.startsWith("/swagger-static")) return true;
  return false;
}

/**
 * Имитация нестабильного бэкенда для мониторинга и отказоустойчивости.
 */
export function registerSimulatedInstability(app: FastifyInstance): void {
  app.addHook("onRequest", async (request, reply) => {
    const path = requestPath(request);
    if (skipSimulatedFailure(path)) return;
    if (Math.random() < failureProbability()) {
      return reply.code(500).send({ error: "simulated_instability" });
    }
  });
}
