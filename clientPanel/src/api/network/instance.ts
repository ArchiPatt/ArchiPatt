import axios from "axios";
import type {AxiosError, AxiosRequestConfig, AxiosResponse} from "axios";
import {tokenStorage} from "../../shared/storage/tokenStorage";
import {refreshStorage} from "../../shared/storage/refreshStorage";
import {authApi} from "../requests/authApi.ts";
import { reportAxiosError } from "../../monitoring/rum.ts";

const AUTH_LOGIN_URL = 'http://localhost:4004/login';
const RETURN_TO = 'http://localhost:5173/';

const instance = axios.create({ baseURL: 'http://localhost:4004/' });

instance.interceptors.request.use((config) => {
    const token = tokenStorage.getItem();
    if (token && typeof token === 'string') {
        config.headers = config.headers ?? {};
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
});

let isRefreshing = false;
let failedQueue: { resolve: (value?: string) => void; reject: (error: unknown) => void }[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) prom.reject(error);
        else prom.resolve(token ?? undefined);
    });
    failedQueue = [];
};

instance.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError) => {
        reportAxiosError(error);
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            const refreshToken = refreshStorage.getItem();
            if (!refreshToken || typeof refreshToken !== 'string') {
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
                        originalRequest.headers['Authorization'] = `Bearer ${token}`;
                    }
                    return instance(originalRequest);
                });
            }

            isRefreshing = true;
            try {
                const { access_token, refresh_token } = await authApi.refreshToken(refreshToken);
                tokenStorage.setItem(access_token);
                refreshStorage.setItem(refresh_token);
                processQueue(null, access_token);

                if (originalRequest.headers) {
                    originalRequest.headers['Authorization'] = `Bearer ${access_token}`;
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
    }
);

export { instance };