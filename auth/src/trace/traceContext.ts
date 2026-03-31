import { AsyncLocalStorage } from "node:async_hooks";

const traceIdAls = new AsyncLocalStorage<string>();

export function enterTraceContext(traceId: string): void {
  traceIdAls.enterWith(traceId);
}

/** Заголовки для исходящих HTTP к другим микросервисам */
export function traceHeaders(): Record<string, string> {
  const id = traceIdAls.getStore();
  return id ? { "x-trace-id": id } : {};
}
