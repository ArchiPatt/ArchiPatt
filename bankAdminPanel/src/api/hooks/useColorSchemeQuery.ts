import { useQuery } from '@tanstack/react-query'
import { getAdminSettingsColorScheme } from '../../../generated/api/adminSettings'

export const useColorSchemeQuery = () => {
   return useQuery({
      queryKey: ['colorScheme'],
      queryFn: () => getAdminSettingsColorScheme()
   })
}
