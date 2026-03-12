import type { OperationReply } from "./types";

const DEFAULT_TIMEOUT_MS = 30_000;

interface Pending {
  resolve: (reply: OperationReply) => void;
  reject: (err: Error) => void;
  timeout: ReturnType<typeof setTimeout>;
}

const pending = new Map<string, Pending>();

export function register(
  correlationId: string,
  timeoutMs: number = DEFAULT_TIMEOUT_MS,
): Promise<OperationReply> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      if (pending.delete(correlationId)) {
        reject(new Error("Operation processing timeout"));
      }
    }, timeoutMs);
    pending.set(correlationId, { resolve, reject, timeout });
  });
}

export function resolve(correlationId: string, reply: OperationReply): void {
  const p = pending.get(correlationId);
  if (!p) return;
  clearTimeout(p.timeout);
  pending.delete(correlationId);
  p.resolve(reply);
}

export function reject(correlationId: string, err: Error): void {
  const p = pending.get(correlationId);
  if (!p) return;
  clearTimeout(p.timeout);
  pending.delete(correlationId);
  p.reject(err);
}
