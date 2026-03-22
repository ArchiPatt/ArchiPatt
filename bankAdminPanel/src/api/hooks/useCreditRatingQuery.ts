import { useQuery } from '@tanstack/react-query'
import { getCreditsRatingByClientId } from '../../../generated/api/credits'

export const useCreditRatingQuery = (clientId: string | undefined) => {
   return useQuery({
      queryKey: ['creditRating', clientId],
      queryFn: () => getCreditsRatingByClientId({ path: { clientId: clientId! } }),
      enabled: !!clientId,
   })
}
