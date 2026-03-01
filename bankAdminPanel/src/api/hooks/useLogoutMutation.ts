import { useMutation, useQueryClient } from '@tanstack/react-query'
import Cookies from 'js-cookie'
import { postLogout } from '../../../generated/api/auth'

export const useLogoutMutation = () => {
   const queryClient = useQueryClient()

   return useMutation({
      mutationFn: () => postLogout(),
      onSuccess: () => {
         Cookies.remove('token')
         queryClient.removeQueries({ queryKey: ['me'] })
      }
   })
}
