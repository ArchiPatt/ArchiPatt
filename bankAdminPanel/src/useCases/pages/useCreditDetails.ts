import { useParams } from 'react-router-dom'
import { useCreditByIdQuery } from '../../api/hooks/useCreditByIdQuery'
import { useCreditPaymentsQuery } from '../../api/hooks/useCreditPaymentsQuery'
import { useTariffByIdQuery } from '../../api/hooks/useTariffByIdQuery'

export const useCreditDetails = () => {
   const { id } = useParams<{ id: string }>()

   const creditQuery = useCreditByIdQuery(id)
   const paymentsQuery = useCreditPaymentsQuery(id)
   const tariffQuery = useTariffByIdQuery(creditQuery.data?.data?.tariffId)

   const isLoading = creditQuery.isLoading || paymentsQuery.isLoading
   const credit = creditQuery.data?.data
   const payments = paymentsQuery.data?.data ?? []
   const tariff = tariffQuery.data

   const principalAmount = Number(credit?.principalAmount)
   const outstandingAmount = Number(credit?.outstandingAmount)
   const progressPercent =
      principalAmount > 0
         ? Math.max(0, Math.min(100, ((principalAmount - outstandingAmount) / principalAmount) * 100))
         : 0

   return {
      state: {
         isLoading,
         credit,
         payments,
         tariff,
         progressPercent
      }
   }
}
