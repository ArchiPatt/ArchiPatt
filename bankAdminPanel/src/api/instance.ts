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

const MUTATING_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE']
const IDEMPOTENCY_CACHE_KEY = '__idempotencyKey'

const attachIdempotencyKey = (config: AxiosRequestConfig & { [IDEMPOTENCY_CACHE_KEY]?: string }) => {
   const method = config.method?.toUpperCase()
   if (!method || !MUTATING_METHODS.includes(method)) return

   const headers = (config.headers ?? {}) as Record<string, string | undefined>
   config.headers = headers
   if (headers['Idempotency-Key'] ?? headers['idempotency-key']) return

   config[IDEMPOTENCY_CACHE_KEY] ??= crypto.randomUUID()
   headers['Idempotency-Key'] = config[IDEMPOTENCY_CACHE_KEY]
}

const recordCircuitOnFinalError = (error: AxiosError) => {
   const s = error.response?.status
   console.log('recordCircuitOnFinalError', error.response, s)
   if (s === 401) {
      gatewayCircuit.recordInfrastructureFailure()
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

      reportAxiosError(error)
      recordCircuitOnFinalError(error)

      if (shouldRetryHttpError(error) && originalRequest && canRetryIdempotentRequest(originalRequest)) {
         const n = originalRequest[INFRA_RETRY] ?? 0
         if (n < 3) {
            originalRequest[INFRA_RETRY] = n + 1
            await axiosRetryDelay(n)
            return instance(originalRequest)
         }
      }

      return Promise.reject(error)
   }
)
