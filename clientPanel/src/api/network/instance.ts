import axios from "axios";
import type { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";
import { tokenStorage } from "../../shared/storage/tokenStorage";
import { refreshStorage } from "../../shared/storage/refreshStorage";
import { authApi } from "../requests/authApi.ts";
import { reportAxiosError, reportAxiosResponse } from "../../monitoring/rum.ts";
import {
  axiosRetryDelay,
  canRetryIdempotentRequest,
  gatewayCircuit,
  shouldRetryHttpError,
} from "../../monitoring/gatewayResilience.ts";
import {createCircuitBreaker} from "./сircuitBreaker.ts";

const AUTH_LOGIN_URL = "http://localhost:4004/login";
const RETURN_TO = "http://localhost:5173/";

const instance = axios.create({ baseURL: "http://localhost:4004/" });

const gatewayCircuit = createCircuitBreaker({
  failureThreshold: 5,
  successThreshold: 2,
  resetTimeoutMs: 10_000,
});

const REQ_START = Symbol.for("archipatt.reqStart");
const INFRA_RETRY = "_archipattInfraRetry";

type ConfigExtras = AxiosRequestConfig & {
  [REQ_START]?: number;
  [INFRA_RETRY]?: number;
  _retry?: boolean;
};

instance.interceptors.request.use((config) => {
  if (!gatewayCircuit.canRequest()) {
    const error = new Error("Circuit breaker OPEN");
    (error as any).isCircuitBreaker = true;
    throw error;
  }

  return config;
});

instance.interceptors.response.use(
    (res) => {
      gatewayCircuit.recordSuccess();
      return res;
    },
    (err) => {
      const status = err.response?.status;

      gatewayCircuit.recordFailure(status);

      throw err;
    }
);

let isRefreshing = false;
let failedQueue: {
  resolve: (value?: string) => void;
  reject: (error: unknown) => void;
}[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token ?? undefined);
  });
  failedQueue = [];
};

instance.interceptors.response.use(
  (response: AxiosResponse) => {
    gatewayCircuit.recordSuccess();
    const cfg = response.config as ConfigExtras;
    const t0 = cfg[REQ_START];
    const durationMs = typeof t0 === "number" ? Date.now() - t0 : 0;
    reportAxiosResponse(cfg, response.status, durationMs);
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as ConfigExtras;

    if (
      shouldRetryHttpError(error) &&
      originalRequest &&
      canRetryIdempotentRequest(originalRequest)
    ) {
      const n = originalRequest[INFRA_RETRY] ?? 0;
      if (n < 3) {
        originalRequest[INFRA_RETRY] = n + 1;
        await axiosRetryDelay(n);
        return instance(originalRequest);
      }
    }

    reportAxiosError(error);
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = refreshStorage.getItem();
      if (!refreshToken || typeof refreshToken !== "string") {
        tokenStorage.removeItem();
        refreshStorage.removeItem();
        window.location.href = `${AUTH_LOGIN_URL}?return_to=${encodeURIComponent(RETURN_TO)}`;
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          if (token && originalRequest.headers) {
            originalRequest.headers["Authorization"] = `Bearer ${token}`;
          }
          return instance(originalRequest);
        });
      }

      isRefreshing = true;
      try {
        const { access_token, refresh_token } =
          await authApi.refreshToken(refreshToken);
        tokenStorage.setItem(access_token);
        refreshStorage.setItem(refresh_token);
        processQueue(null, access_token);

        if (originalRequest.headers) {
          originalRequest.headers["Authorization"] = `Bearer ${access_token}`;
        }
        return instance(originalRequest);
      } catch (err) {
        processQueue(err, null);
        tokenStorage.removeItem();
        refreshStorage.removeItem();
        window.location.href = `${AUTH_LOGIN_URL}?return_to=${encodeURIComponent(RETURN_TO)}`;
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export { instance };
