import { useMutation, useQueryClient } from '@tanstack/react-query'
import Cookies from 'js-cookie'
import { postLogout } from '../../../generated/api/auth'

const AUTH_URL = 'http://localhost:4000'

export const useLogoutMutation = () => {
   const queryClient = useQueryClient()

   return useMutation({
      mutationFn: () => postLogout(),
      onSuccess: () => {
         Cookies.remove('accessToken')
         Cookies.remove('refreshToken')
         queryClient.clear()
         const returnTo = encodeURIComponent(window.location.origin + '/')
         window.location.replace(`${AUTH_URL}/logout-session?return_to=${returnTo}`)
      }
   })
}
