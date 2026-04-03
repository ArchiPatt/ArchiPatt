import axios, { AxiosError, type AxiosRequestConfig, type AxiosResponse } from 'axios'
import Cookies from 'js-cookie'
import { reportAxiosError, reportAxiosResponse } from '../monitoring/rum'
import {
   axiosRetryDelay,
   canRetryIdempotentRequest,
   gatewayCircuit,
   shouldRetryHttpError
} from '../monitoring/gatewayResilience'

export const instance = axios.create({ baseURL: 'http://localhost:4004' })

const REQ_START = Symbol.for('archipatt.reqStart')
const INFRA_RETRY = '_archipattInfraRetry'

type ConfigExtras = AxiosRequestConfig & {
   [REQ_START]?: number
   [INFRA_RETRY]?: number
}

function attachIdempotencyKey(config: AxiosRequestConfig): void {
   const m = config.method?.toUpperCase()
   if (!m || !['POST', 'PUT', 'PATCH', 'DELETE'].includes(m)) return
   config.headers = config.headers ?? {}
   const h = config.headers as Record<string, string | undefined>
   if (h['Idempotency-Key'] ?? h['idempotency-key']) return
   const sym = Symbol.for('archipatt.idempotencyKey')
   type WithKey = typeof config & { [k: symbol]: string | undefined }
   const w = config as WithKey
   if (!w[sym]) {
      w[sym] =
         typeof crypto !== 'undefined' && 'randomUUID' in crypto
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
   }
   h['Idempotency-Key'] = w[sym]
}

function recordCircuitOnFinalError(error: AxiosError): void {
   const s = error.response?.status
   if (s === 401) {
      gatewayCircuit.recordSuccess()
      return
   }
   if (!error.response || (s !== undefined && (s >= 500 || s === 408 || s === 429))) {
      gatewayCircuit.recordInfrastructureFailure()
   } else {
      gatewayCircuit.recordSuccess()
   }
}

instance.interceptors.request.use((config) => {
   try {
      gatewayCircuit.beforeRequest()
   } catch (e) {
      return Promise.reject(e)
   }
   attachIdempotencyKey(config)
   const token = Cookies.get('accessToken')
   if (token) {
      config.headers = config.headers ?? {}
      config.headers['Authorization'] = `Bearer ${token}`
   }
   ;(config as ConfigExtras)[REQ_START] = Date.now()
   return config
})

instance.interceptors.response.use(
   (response: AxiosResponse) => {
      gatewayCircuit.recordSuccess()
      const cfg = response.config as ConfigExtras
      const t0 = cfg[REQ_START]
      const durationMs = typeof t0 === 'number' ? Date.now() - t0 : 0
      reportAxiosResponse(cfg, response.status, durationMs)
      return response
   },
   async (error: AxiosError) => {
      const originalRequest = error.config as ConfigExtras

      if (shouldRetryHttpError(error) && originalRequest && canRetryIdempotentRequest(originalRequest)) {
         const n = originalRequest[INFRA_RETRY] ?? 0
         if (n < 3) {
            originalRequest[INFRA_RETRY] = n + 1
            await axiosRetryDelay(n)
            return instance(originalRequest)
         }
      }

      reportAxiosError(error)
      recordCircuitOnFinalError(error)
      return Promise.reject(error)
   }
)
