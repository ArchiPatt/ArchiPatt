import { useQuery } from '@tanstack/react-query'
import { getDashboardClientsOverview } from '../../../generated/api/core/requests/core/getDashboardClientsOverview.gen'
import type {
   GetDashboardClientsOverviewData
} from '../../../generated/api/core/types.gen'

export const useDashboardClientsOverviewQuery = (query: GetDashboardClientsOverviewData['query']) => {
   return useQuery({
      queryKey: ['dashboardClientsOverview', { limit: query?.limit, offset: query?.offset }],
      queryFn: () =>
         getDashboardClientsOverview({
            query
         })
   })
}
