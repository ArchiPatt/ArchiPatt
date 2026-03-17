import { notifications } from '@mantine/notifications'
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
   defaultOptions: {
      queries: {
         refetchOnWindowFocus: false,
         refetchOnReconnect: false,
         retry: false,
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
