import { notifications } from '@mantine/notifications'
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
   defaultOptions: {
      queries: {
         refetchOnWindowFocus: false,
         refetchOnReconnect: false,
         retry: 0,
         retryDelay: (attempt) => 80 * 2 ** attempt + Math.floor(Math.random() * 40)
      },
      mutations: {
         onError: (error) => {
            notifications.show({
               color: 'red',
               title: 'Ошибка',
               message: error instanceof Error ? error.message : 'Произошла ошибка'
            })
         }
      }
   }
})
