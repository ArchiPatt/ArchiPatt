import { useQuery } from '@tanstack/react-query'
import { getCreditByIdPayments } from '../../../generated/api/credits/requests/Credits/getCreditByIdPayments.gen'

export const useCreditPaymentsQuery = (id: string | undefined) => {
   return useQuery({
      queryKey: ['creditPayments', id],
      queryFn: () => getCreditByIdPayments({ path: { id: id! } }),
      enabled: !!id
   })
}
