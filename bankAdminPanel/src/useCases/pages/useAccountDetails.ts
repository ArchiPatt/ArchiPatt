import { useParams } from 'react-router-dom'
import { useAccountByIdQuery } from '../../api/hooks/useAccountByIdQuery'
import { useAccountOperationsWS } from '../../api/hooks/useAccountOperationsWS'

const defaultLimit = 10

export const useAccountDetails = () => {
   const { id } = useParams<{ id: string }>()

   const accountQuery = useAccountByIdQuery(id)

   const { operations, isLoading: operationsLoading } = useAccountOperationsWS(id!)

   const isLoading = accountQuery.isLoading || operationsLoading
   const account = accountQuery.data?.data

   return {
      state: {
         defaultLimit,
         isLoading,
         account,
         operations
      }
   }
}
