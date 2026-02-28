import { useMutation, useQueryClient } from '@tanstack/react-query'
import { postTariffs } from '../../../generated/api/credits/requests/Credits/postTariffs.gen'
import type { PostTariffsData } from '../../../generated/api/credits/types.gen'

export const useCreateTariffMutation = () => {
   const queryClient = useQueryClient()

   return useMutation({
      mutationFn: (body: PostTariffsData['body']) => postTariffs({ body }),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ['tariffs'] })
      }
   })
}

