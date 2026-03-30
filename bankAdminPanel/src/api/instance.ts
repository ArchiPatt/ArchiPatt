import axios from 'axios'
import Cookies from 'js-cookie'
import { reportAxiosError } from '../monitoring/rum'

export const instance = axios.create({ baseURL: 'http://localhost:4004' })

instance.interceptors.request.use((config) => {
   const token = Cookies.get('accessToken')
   if (token) {
      config.headers = config.headers ?? {}
      config.headers['Authorization'] = `Bearer ${token}`
   }
   return config
})

instance.interceptors.response.use(
   (r) => r,
   (err) => {
      reportAxiosError(err)
      return Promise.reject(err)
   },
)
