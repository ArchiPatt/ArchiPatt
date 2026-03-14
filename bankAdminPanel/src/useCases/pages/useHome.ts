import { useSearchParams } from 'react-router-dom'
import { useDashboardClientsOverviewQuery } from '../../api/hooks/useDashboardClientsOverviewQuery'

const defaultLimit = 10

export const useHome = () => {
   const [searchParams, setSearchParams] = useSearchParams()

   const pageParam = Number(searchParams.get('page') || '1')
   const limitParam = Number(searchParams.get('limit') || `${defaultLimit}`)

   const page = Number.isNaN(pageParam) || pageParam < 1 ? 1 : pageParam
   const limit = Number.isNaN(limitParam) || limitParam <= 0 ? defaultLimit : limitParam

   const offset = (page - 1) * limit

   const dashboardQuery = useDashboardClientsOverviewQuery({ limit, offset })

   const isLoading = dashboardQuery.isLoading

   const dashboardData = dashboardQuery.data?.data

   const total = dashboardData?.total ?? 0
   const totalPages = total > 0 ? Math.ceil(total / limit) : 1

   const handlePageChange = (nextPage: number) => {
      setSearchParams((prev) => {
         const next = new URLSearchParams(prev)

         next.set('page', String(nextPage))
         next.set('limit', String(limit))

         return next
      })
   }

   return {
      state: { page, limit, total, totalPages, dashboardData, isLoading },
      functions: { handlePageChange }
   }
}
