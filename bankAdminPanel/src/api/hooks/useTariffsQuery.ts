import { useQuery } from '@tanstack/react-query'
import { getTariffs } from '../../../generated/api/credits/requests/Credits/getTariffs.gen'

export const useTariffsQuery = () => {
   return useQuery({
      queryKey: ['tariffs'],
      queryFn: () => getTariffs()
   })
}

