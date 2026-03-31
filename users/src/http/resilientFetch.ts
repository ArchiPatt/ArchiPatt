const MAX_ATTEMPTS = 4;
const BASE_DELAY_MS = 80;
const WINDOW_SIZE = 40;
const MIN_SAMPLES = 8;

const FAILURE_RATE_OPEN = 0.7;
const OPEN_COOLDOWN_MS = 30_000;

export class CircuitOpenError extends Error {
  readonly circuitName: string;
  constructor(circuitName: string) {
    super(`circuit open: ${circuitName}`);
    this.name = "CircuitOpenError";
    this.circuitName = circuitName;
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function backoffMs(attemptIndex: number): number {
  const exp = BASE_DELAY_MS * 2 ** attemptIndex;
  return exp + Math.floor(Math.random() * 40);
}

function isRetryableHttpStatus(status: number): boolean {
  return status >= 500 || status === 408 || status === 429;
}

function isCircuitSuccess(res: Response): boolean {
  if (res.ok) return true;
  if (res.status === 404) return true;
  if (
    res.status >= 400 &&
    res.status < 500 &&
    !isRetryableHttpStatus(res.status)
  ) {
    return true;
  }
  return false;
}

class CircuitBreaker {
  private openUntil = 0;
  private outcomes: boolean[] = [];

  constructor(readonly name: string) {}

  beforeCall(): void {
    const now = Date.now();
    if (now < this.openUntil) {
      throw new CircuitOpenError(this.name);
    }
  }

  record(success: boolean): void {
    this.outcomes.push(success);
    if (this.outcomes.length > WINDOW_SIZE) this.outcomes.shift();
    if (this.outcomes.length < MIN_SAMPLES) return;
    const fails = this.outcomes.filter((x) => !x).length;
    const rate = fails / this.outcomes.length;
    if (rate >= FAILURE_RATE_OPEN) {
      this.openUntil = Date.now() + OPEN_COOLDOWN_MS;
      this.outcomes = [];
    }
  }
}

const breakers = new Map<string, CircuitBreaker>();

function getBreaker(name: string): CircuitBreaker {
  let b = breakers.get(name);
  if (!b) {
    b = new CircuitBreaker(name);
    breakers.set(name, b);
  }
  return b;
}

/**
 * fetch с повторными попытками при 5xx/сетевых сбоях и circuit breaker по имени зависимости.
 */
export async function resilientFetch(
  circuitName: string,
  url: string | URL,
  init?: RequestInit,
): Promise<Response> {
  const breaker = getBreaker(circuitName);
  breaker.beforeCall();

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    try {
      const res = await fetch(url, init);
      if (isRetryableHttpStatus(res.status) && attempt < MAX_ATTEMPTS - 1) {
        await sleep(backoffMs(attempt));
        continue;
      }
      breaker.record(isCircuitSuccess(res));
      return res;
    } catch (e) {
      if (attempt < MAX_ATTEMPTS - 1) {
        await sleep(backoffMs(attempt));
        continue;
      }
      breaker.record(false);
      throw e;
    }
  }
  throw new Error("resilientFetch: unreachable");
}

export const CIRCUIT_USERS_SERVICE = "users-service";
export const CIRCUIT_CREDITS_SERVICE = "credits-service";
export const CIRCUIT_CORE_SERVICE = "core-service";
export const CIRCUIT_AUTH_SERVICE = "auth-service";
