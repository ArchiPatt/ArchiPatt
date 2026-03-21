import { useMutation, useQueryClient } from '@tanstack/react-query'
import Cookies from 'js-cookie'
import { postLogout } from '../../../generated/api/auth'

const AUTH_URL = 'http://localhost:4000'

export const useLogoutMutation = () => {
   const queryClient = useQueryClient()

   return useMutation({
      mutationFn: async () => {
         try {
            await postLogout()
         } catch {
            // Игнорируем ошибки (токен мог уже истечь)
         }
         Cookies.remove('accessToken')
         Cookies.remove('refreshToken')
         queryClient.removeQueries({ queryKey: ['me'] })
         const returnTo = encodeURIComponent(window.location.origin + '/')
         window.location.href = `${AUTH_URL}/logout-session?return_to=${returnTo}`
      },
   })
}
