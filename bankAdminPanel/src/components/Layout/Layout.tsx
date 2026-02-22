import {
   AppShell,
   Group,
   Button,
   Text,
   Box,
   UnstyledButton,
   ActionIcon,
   Tooltip,
   useMantineColorScheme
} from '@mantine/core'
import { Outlet, useLocation, Link } from 'react-router-dom'
import { useUserQuery } from '../../hooks/useUserQuery'
import { useLogoutMutation } from '../../hooks/useLogoutMutation'
import classes from './Layout.module.css'
import { useEffect } from 'react'
import type { AxiosError } from 'axios'

const PROJECT_NAME = 'Панель управления банком'

const NAV_ITEMS = [
   { to: '/', label: 'Счета' },
   { to: '/tariffs', label: 'Тарифы' },
   { to: '/users', label: 'Пользователи' }
] as const

export const Layout = () => {
   const { pathname } = useLocation()
   const user = useUserQuery()
   const logout = useLogoutMutation()
   const { colorScheme, toggleColorScheme } = useMantineColorScheme()

   const displayName = user.data?.data?.displayName ?? user.data?.data?.username ?? 'Пользователь'

   useEffect(() => {
      const status = (user.error as AxiosError | null)?.response?.status || 200
      console.log(status, user.data, user.error, user.error?.name)
      if (user.isError) {
         window.location.replace('http://localhost:4000/login?return_to=http://localhost:5173/')
      }
   }, [user.error])

   return (
      <AppShell header={{ height: 64 }} padding="md">
         <AppShell.Header className={classes.header}>
            <Text component="span" className={classes.logo} fw={700} size="lg">
               {PROJECT_NAME}
            </Text>
            <nav className={classes.nav}>
               {NAV_ITEMS.map(({ to, label }) => (
                  <UnstyledButton
                     key={to}
                     component={Link}
                     to={to}
                     className={classes.navLink}
                     data-active={pathname === to}
                  >
                     {label}
                  </UnstyledButton>
               ))}
            </nav>
            <Group gap="md" className={classes.userBlock}>
               <Text size="md" fw={500}>
                  {displayName}
               </Text>
               <Tooltip
                  label={colorScheme === 'light' ? 'Тёмная тема' : 'Светлая тема'}
                  position="bottom"
               >
                  <ActionIcon
                     variant="light"
                     size="lg"
                     aria-label="Сменить тему"
                     onClick={() => toggleColorScheme()}
                  >
                     {colorScheme === 'light' ? '🌙' : '☀️'}
                  </ActionIcon>
               </Tooltip>
               <Button
                  variant="light"
                  color="red"
                  size="sm"
                  loading={logout.isPending}
                  onClick={() => logout.mutate()}
               >
                  Выход
               </Button>
            </Group>
         </AppShell.Header>
         <AppShell.Main>
            <Box p="md">
               <Outlet />
            </Box>
         </AppShell.Main>
      </AppShell>
   )
}
