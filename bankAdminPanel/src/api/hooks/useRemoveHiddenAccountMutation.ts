import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteAdminSettingsHiddenAccountByAccountId } from '../../../generated/api/adminSettings'

export const useRemoveHiddenAccountMutation = () => {
   const queryClient = useQueryClient()

   return useMutation({
      mutationFn: (accountId: string) => deleteAdminSettingsHiddenAccountByAccountId({ path: { accountId } }),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ['hiddenAccounts'] })
      }
   })
}
