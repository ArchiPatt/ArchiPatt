import type {AxiosRequestConfig} from "axios";

const IDEMPOTENCY_METHODS = ['POST', 'PUT', 'PATCH']


const idempotencyKey = (config: AxiosRequestConfig) => {
    const method = config.method?.toUpperCase()
    if (!method || !IDEMPOTENCY_METHODS.includes(method)) {
        return
    }

    const header = config.headers ?? {}

    config.headers = header

    if (header["Idempotency-Key"] ?? header["idempotency-key"]) return

    const key = crypto.randomUUID()

    header["Idempotency-Key"] = key
}

export { idempotencyKey }
