import type { FastifyInstance, FastifyRequest } from "fastify";

/**
 * Доля ответов 500: в чётные минуты часа — 70%, в нечётные — 30%.
 */
function failureProbability(): number {
  return new Date().getMinutes() % 2 === 0 ? 0.7 : 0.3;
}

function requestPath(req: FastifyRequest): string {
  return (req.raw.url ?? "").split("?")[0] ?? "";
}

/** Не ломаем Swagger UI, health и статику swagger-ui-dist */
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
