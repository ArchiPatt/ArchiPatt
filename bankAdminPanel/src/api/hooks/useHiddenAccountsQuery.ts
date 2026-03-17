import { useQuery } from '@tanstack/react-query'
import { getAdminSettingsHiddenAccounts } from '../../../generated/api/adminSettings'

export const useHiddenAccountsQuery = () => {
   return useQuery({
      queryKey: ['hiddenAccounts'],
      queryFn: () => getAdminSettingsHiddenAccounts()
   })
}
