import { useQuery } from '@tanstack/react-query'
import { getMe } from '../../generated/api/user'

export type Me = {
   displayName?: string
   username?: string
}

export const useUserQuery = () => {
   return useQuery({
      queryKey: ['me'],
      queryFn: () => getMe()
   })
}
