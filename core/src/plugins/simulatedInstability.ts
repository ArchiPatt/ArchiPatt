import type { FastifyInstance } from "fastify";

/**
 * Доля ответов 500: в чётные минуты часа — 70%, в нечётные — 30%.
 */
function failureProbability(): number {
  return new Date().getMinutes() % 2 === 0 ? 0.7 : 0.3;
}

/**
 * Имитация нестабильного бэкенда для мониторинга и отказоустойчивости.
 */
export function registerSimulatedInstability(app: FastifyInstance): void {
  app.addHook("onRequest", async (_request, reply) => {
    if (Math.random() < failureProbability()) {
      return reply.code(500).send({ error: "simulated_instability" });
    }
  });
}
