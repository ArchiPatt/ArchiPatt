import type { FastifyInstance, FastifyRequest } from "fastify";

/** Требование: по умолчанию ~30% ответов 500 (нечётные минуты часа 1,3,5,…) */
const FAILURE_RATE_ODD_MINUTE = 0.3;
/** Требование: в чётные минуты часа (0,2,4,…) – ~70% ответов 500 */
const FAILURE_RATE_EVEN_MINUTE = 0.7;

/**
 * Вероятность 500 для **каждого** запроса (независимо): при большом числе запросов
 * доля ошибок по закону больших чисел стремится к этим процентам – «получить все
 * данные» с первого раза статистически маловероятно; это ожидаемо для хаос-теста.
 */
function failureProbability(): number {
  const minute = new Date().getMinutes();
  return minute % 2 === 0 ? FAILURE_RATE_EVEN_MINUTE : FAILURE_RATE_ODD_MINUTE;
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
