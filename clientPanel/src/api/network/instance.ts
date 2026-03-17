import axios from "axios";
import type {AxiosError, AxiosRequestConfig, AxiosResponse} from "axios";
import {tokenStorage} from "../../shared/storage/tokenStorage";
import {refreshStorage} from "../../shared/storage/refreshStorage";
import {authApi} from "../requests/authApi.ts";

const instance = axios.create({ baseURL: 'http://localhost:4004/' })


instance.interceptors.request.use((config) => {
    const token = tokenStorage.getItem()
    if (token) {
        config.headers = config.headers ?? {}
        config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
})

export { instance }