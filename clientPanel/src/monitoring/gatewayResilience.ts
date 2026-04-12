import type { AxiosRequestConfig } from "axios";
import axios from "axios";

const WINDOW = 40;
const MIN_SAMPLES = 8;
const OPEN_THRESHOLD = 0.7;
const COOLDOWN_MS = 30_000;

class GatewayCircuitBreaker {
  private openUntil = 0;
  private outcomes: boolean[] = [];

  beforeRequest(): void {
    if (Date.now() < this.openUntil) {
      const err = new Error(
        "Сервис временно недоступен (слишком много ошибок). Повторите позже.",
      );
      (err as Error & { code?: string }).code = "CIRCUIT_OPEN";
      throw err;
    }
  }

  recordSuccess(): void {
    this.push(true)
  }

  recordInfrastructureFailure(): void {
    this.push(false)
  }

  private push(ok: boolean): void {
    this.outcomes.push(ok)
    if (this.outcomes.length > WINDOW) this.outcomes.shift()
    if (this.outcomes.length < MIN_SAMPLES) return
    const fails = this.outcomes.filter((x) => !x).length
    if (fails / this.outcomes.length >= OPEN_THRESHOLD) {
      this.openUntil = Date.now() + COOLDOWN_MS
      this.outcomes = [];
    }
  }
}

const gatewayCircuit = new GatewayCircuitBreaker()

const canRetryIdempotentRequest = (config: AxiosRequestConfig) => {
  const m = (config.method ?? "GET").toUpperCase()
  if (m === "GET" || m === "HEAD" || m === "OPTIONS") return true
  const h = config.headers as Record<string, string | undefined>
  return Boolean(h?.["Idempotency-Key"] ?? h?.["idempotency-key"]);
}

const shouldRetryHttpError = (error: unknown) => {
  if (!axios.isAxiosError(error)) return false
  if (error.response?.status === 401) return true
  if (!error.response) return true
  const s = error.response.status
  return s >= 500 || s === 408 || s === 429;
}

const axiosRetryDelay = async (attemptIndex: number) => {
  const ms = 80 * 2 ** attemptIndex + Math.floor(Math.random() * 40)
  await new Promise((r) => setTimeout(r, ms))
}

export { gatewayCircuit, canRetryIdempotentRequest, shouldRetryHttpError, axiosRetryDelay }
