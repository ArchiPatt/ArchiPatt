import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTokenMutation } from '../../api/hooks/useTokenMutation'
import { useLogoutMutation } from '../../api/hooks/useLogoutMutation'
import { useUserQuery } from '../../api/hooks/useUserQuery'
import Cookies from 'js-cookie'

export const useAuth = () => {
   const user = useUserQuery()
   const [searchParams, setSearchParams] = useSearchParams()
   const token = useTokenMutation()
   const logout = useLogoutMutation()
   const code = searchParams.get('code')

   useEffect(() => {
      const interval = setInterval(() => {
         const refreshToken = Cookies.get('refreshToken')
         if (refreshToken) {
            token.mutate({ grant_type: 'refresh_token', refresh_token: refreshToken })
         }
      }, 60000)

      return () => clearInterval(interval)
   }, [])

   useEffect(() => {
      console.log('useAuth user.error', user.error)
      if (user.error && !code) {
         const status = (user.error as import('axios').AxiosError)?.response?.status
         console.log('useAuth user.error status', status)
         if (status === 401) {
            window.location.replace('http://localhost:4000/login?return_to=http://localhost:5183/')
         }
      }
   }, [user.error])

   useEffect(() => {
      if (code) {
         token
            .mutateAsync({ grant_type: 'authorization_code', code })
            .then(() => {
               setSearchParams(new URLSearchParams())
               window.location.reload()
            })
            .finally(() => {
               setSearchParams(new URLSearchParams())
               window.location.reload()
            })
      }
   }, [searchParams])

   return { logout, user }
}
