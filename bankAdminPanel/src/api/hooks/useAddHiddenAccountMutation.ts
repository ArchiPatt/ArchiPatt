import { useMutation, useQueryClient } from '@tanstack/react-query'
import { postAdminSettingsHiddenAccounts } from '../../../generated/api/adminSettings'

export const useAddHiddenAccountMutation = () => {
   const queryClient = useQueryClient()

   return useMutation({
      mutationFn: (accountId: string) => postAdminSettingsHiddenAccounts({ body: { accountId } }),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ['hiddenAccounts'] })
      }
   })
}
