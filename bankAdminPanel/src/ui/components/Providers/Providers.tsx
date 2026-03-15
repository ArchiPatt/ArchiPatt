import { MantineProvider } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import { queryClient } from '../../../consts/queryClient'
import { QueryClientProvider } from '@tanstack/react-query'
import { ModalsProvider } from '@mantine/modals'
import { CreateTariffModal } from '../Modals/CreateTariffModal'
import { CreateUserModal } from '../Modals/CreateUserModal'

export const Providers = ({ children }: { children: React.ReactNode }) => {
   return (
      <QueryClientProvider client={queryClient}>
         <MantineProvider defaultColorScheme="auto">
            <ModalsProvider modals={{ createTariff: CreateTariffModal, createUser: CreateUserModal }}>
               {children}
               <Notifications />
            </ModalsProvider>
         </MantineProvider>
      </QueryClientProvider>
   )
}
