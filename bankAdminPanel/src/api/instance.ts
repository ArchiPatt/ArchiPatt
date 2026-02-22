import axios from 'axios'
import Cookies from 'js-cookie'

export const instance = axios.create({ baseURL: 'http://localhost:4001' })

instance.interceptors.request.use((config) => {
   const token = Cookies.get('token')
   if (token) {
      config.headers = config.headers ?? {}
      config.headers['Authorization'] = `Bearer ${token}`
   }
   return config
})
