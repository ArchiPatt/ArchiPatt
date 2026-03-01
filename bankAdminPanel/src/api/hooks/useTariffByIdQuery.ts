import { useQuery } from '@tanstack/react-query'
import { getTariffs } from '../../../generated/api/credits/requests/Credits/getTariffs.gen'

export const useTariffByIdQuery = (id: string | undefined) => {
   return useQuery({
      queryKey: ['tariffs'],
      queryFn: () => getTariffs(),
      select: (response) => {
         const tariff = response.data?.find((t) => t.id === id)
         return tariff
      },
      enabled: !!id
   })
}
