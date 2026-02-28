import { useQuery } from '@tanstack/react-query'
import { getAccountByIdOperations } from '../../../generated/api/core/requests/Core/getAccountByIdOperations.gen'
import type { GetAccountsByIdOperationsData } from '../../../generated/api/core/types.gen'

export const useAccountOperationsQuery = (
   id: string | undefined,
   query?: GetAccountsByIdOperationsData['query']
) => {
   return useQuery({
      queryKey: ['accountOperations', id, query?.limit, query?.offset, query?.sort],
      queryFn: () =>
         getAccountByIdOperations({
            path: { id: id! },
            query
         }),
      enabled: !!id
   })
}
