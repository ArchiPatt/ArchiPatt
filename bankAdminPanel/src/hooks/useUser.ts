import { useQuery } from '@tanstack/react-query'
import { getMe } from '../../generated/api/user'

export type Me = {
   displayName?: string
   username?: string
}

export const useUser = () => {
   return useQuery({
      queryKey: ['me'],
      queryFn: async () => {
         const { data } = await getMe()
         return data as Me
      }
   })
}
