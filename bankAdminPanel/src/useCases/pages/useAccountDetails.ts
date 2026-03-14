import { useParams, useSearchParams } from 'react-router-dom'
import { useAccountByIdQuery } from '../../api/hooks/useAccountByIdQuery'
import { useAccountOperationsQuery } from '../../api/hooks/useAccountOperationsQuery'

const defaultLimit = 10

export const useAccountDetails = () => {
   const { id } = useParams<{ id: string }>()
   const [searchParams, setSearchParams] = useSearchParams()

   const pageParam = Number(searchParams.get('page') || '1')
   const page = Number.isNaN(pageParam) || pageParam < 1 ? 1 : pageParam
   const offset = (page - 1) * defaultLimit

   const accountQuery = useAccountByIdQuery(id)
   const operationsQuery = useAccountOperationsQuery(id, {
      limit: defaultLimit,
      offset
   })

   const isLoading = accountQuery.isLoading || operationsQuery.isLoading
   const account = accountQuery.data?.data
   const operations = operationsQuery.data?.data?.items ?? []
   const total = operationsQuery.data?.data?.total ?? 0
   const totalPages = total > 0 ? Math.ceil(total / defaultLimit) : 1

   const handlePageChange = (nextPage: number) => {
      setSearchParams((prev) => {
         const next = new URLSearchParams(prev)
         next.set('page', String(nextPage))
         return next
      })
   }

   return {
      state: {
         defaultLimit,
         page,
         isLoading,
         account,
         operations,
         total,
         totalPages
      },
      functions: {
         handlePageChange
      }
   }
}
