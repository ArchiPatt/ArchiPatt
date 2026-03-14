import { modals } from '@mantine/modals'
import { useTariffsQuery } from '../../api/hooks/useTariffsQuery'

export const useTariffs = () => {
   const tariffsQuery = useTariffsQuery()

   const isLoading = tariffsQuery.isLoading
   const isFetched = tariffsQuery.isFetched
   const tariffsData = tariffsQuery.data?.data

   const handleOpenCreateTariff = () => {
      modals.openContextModal({
         modal: 'createTariff',
         title: 'Создать тариф',
         innerProps: {}
      })
   }

   return {
      state: {
         isLoading,
         isFetched,
         tariffsData
      },
      functions: {
         handleOpenCreateTariff
      }
   }
}
