import { useSearchParams } from 'react-router-dom'
import { useDashboardClientsOverviewQuery } from '../../api/hooks/useDashboardClientsOverviewQuery'
import { useHiddenAccountsQuery } from '../../api/hooks/useHiddenAccountsQuery'
import { useAddHiddenAccountMutation } from '../../api/hooks/useAddHiddenAccountMutation'
import { useRemoveHiddenAccountMutation } from '../../api/hooks/useRemoveHiddenAccountMutation'

const defaultLimit = 10

export const useHome = () => {
   const [searchParams, setSearchParams] = useSearchParams()

   const pageParam = Number(searchParams.get('page') || '1')
   const limitParam = Number(searchParams.get('limit') || `${defaultLimit}`)

   const page = Number.isNaN(pageParam) || pageParam < 1 ? 1 : pageParam
   const limit = Number.isNaN(limitParam) || limitParam <= 0 ? defaultLimit : limitParam

   const offset = (page - 1) * limit

   const dashboardQuery = useDashboardClientsOverviewQuery({ limit, offset })
   const hiddenAccountsQuery = useHiddenAccountsQuery()
   const addHiddenAccountMutation = useAddHiddenAccountMutation()
   const removeHiddenAccountMutation = useRemoveHiddenAccountMutation()

   const isLoading = dashboardQuery.isLoading || hiddenAccountsQuery.isLoading

   const dashboardData = dashboardQuery.data?.data
   const hiddenAccounts = new Set(hiddenAccountsQuery.data?.data?.hiddenAccounts ?? [])

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

   const handleHideAccount = (accountId: string) => {
      addHiddenAccountMutation.mutate(accountId)
   }

   const handleShowAccount = (accountId: string) => {
      removeHiddenAccountMutation.mutate(accountId)
   }

   return {
      state: { page, limit, total, totalPages, dashboardData, isLoading, hiddenAccounts },
      functions: { handlePageChange, handleHideAccount, handleShowAccount }
   }
}
