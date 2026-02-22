import { MantineProvider } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import { queryClient } from '../../consts/queryClient'
import { QueryClientProvider } from '@tanstack/react-query'

export const Providers = ({ children }: { children: React.ReactNode }) => {
   return (
      <QueryClientProvider client={queryClient}>
         <MantineProvider>
            {children}
            <Notifications />
         </MantineProvider>
      </QueryClientProvider>
   )
}
