import { useQuery } from '@tanstack/react-query'
import { getCreditById } from '../../../generated/api/credits/requests/credits/getCreditById.gen'

export const useCreditByIdQuery = (id: string | undefined) => {
   return useQuery({
      queryKey: ['credit', id],
      queryFn: () => getCreditById({ path: { id: id! } }),
      enabled: !!id
   })
}
