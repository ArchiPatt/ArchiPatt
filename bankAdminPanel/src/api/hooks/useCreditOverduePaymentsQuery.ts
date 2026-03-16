import { useQuery } from '@tanstack/react-query'
import { getCreditsOverduePayments } from '../../../generated/api/credits'

export const useCreditOverduePaymentsQuery = (creditId: string | undefined) => {
   return useQuery({
      queryKey: ['creditOverduePayments', creditId],
      queryFn: () => getCreditsOverduePayments(),
      select: (response) => {
         const allOverdue = response.data ?? []
         return allOverdue.filter((payment) => payment.creditId === creditId)
      },
      enabled: !!creditId
   })
}
