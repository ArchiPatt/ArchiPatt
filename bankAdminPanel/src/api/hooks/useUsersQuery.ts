import { useQuery } from '@tanstack/react-query'
import { getUsers } from '../../../generated/api/user/requests/Users/getUsers.gen'

export const useUsersQuery = () => {
   return useQuery({
      queryKey: ['users'],
      queryFn: () => getUsers()
   })
}

