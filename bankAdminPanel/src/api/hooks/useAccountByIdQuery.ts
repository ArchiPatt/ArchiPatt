import { useQuery } from '@tanstack/react-query'
import { getAccountById } from '../../../generated/api/core/requests/Core/getAccountById.gen'

export const useAccountByIdQuery = (id: string | undefined) => {
   return useQuery({
      queryKey: ['account', id],
      queryFn: () => getAccountById({ path: { id: id! } }),
      enabled: !!id
   })
}
