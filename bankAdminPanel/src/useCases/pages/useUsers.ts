import { modals } from '@mantine/modals'
import { useBlockUserMutation } from '../../api/hooks/useBlockUserMutation'
import { useUserQuery } from '../../api/hooks/useUserQuery'
import { useUsersQuery } from '../../api/hooks/useUsersQuery'

export const useUsers = () => {
   const usersQuery = useUsersQuery()
   const blockUser = useBlockUserMutation()
   const meQuery = useUserQuery()

   const usersData = usersQuery.data?.data
   const meData = meQuery.data?.data

   const isLoading = usersQuery.isLoading || meQuery.isLoading
   const isError = usersQuery.isError || meQuery.isError

   const handleOpenCreateUserModal = () => {
      modals.openContextModal({ modal: 'createUser', title: 'Создать пользователя', innerProps: {} })
   }

   return {
      state: { meData, usersData, isLoading, isError, blockUser },
      functions: {
         handleOpenCreateUserModal
      }
   }
}
