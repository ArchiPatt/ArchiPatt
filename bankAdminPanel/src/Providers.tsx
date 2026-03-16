import { MantineProvider } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import { queryClient } from './consts/queryClient'
import { QueryClientProvider } from '@tanstack/react-query'
import { ModalsProvider } from '@mantine/modals'
import { CreateTariffModal } from './ui/components/Modals/CreateTariffModal'
import { CreateUserModal } from './ui/components/Modals/CreateUserModal'
import type { ReactNode } from 'react'

interface ProcidersProps {
   children: ReactNode
}

export const Providers = ({ children }: ProcidersProps) => {
   return (
      <QueryClientProvider client={queryClient}>
         <MantineProvider defaultColorScheme="auto" >
            <ModalsProvider modals={{ createTariff: CreateTariffModal, createUser: CreateUserModal }}>
               {children}
               <Notifications />
            </ModalsProvider>
         </MantineProvider>
      </QueryClientProvider>
   )
}
