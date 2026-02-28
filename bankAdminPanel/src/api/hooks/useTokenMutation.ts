import { useMutation, useQueryClient } from '@tanstack/react-query'
import Cookies from 'js-cookie'
import { postToken, type PostTokenData } from '../../../generated/api/auth'

export const useTokenMutation = () => {
   const queryClient = useQueryClient()

   return useMutation({
      mutationFn: (body: PostTokenData['body']) => postToken({ body }),
      onSuccess: (data) => {
         Cookies.set('accessToken', data.data.access_token!)
         Cookies.set('refreshToken', data.data.refresh_token!)
         queryClient.invalidateQueries({ queryKey: ['me'] })
      }
   })
}
