import axios from "axios";
import {tokenStorage} from "../storage/tokenStorage";

const instance = axios.create({ baseURL: 'http://localhost:4004' })


instance.interceptors.request.use((config) => {
    const token = tokenStorage.getItem()
    if (token) {
        config.headers = config.headers ?? {}
        config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
})

export { instance }