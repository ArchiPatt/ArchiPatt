import {
   AppShell,
   Group,
   Button,
   Text,
   UnstyledButton,
   ActionIcon,
   Tooltip,
   useMantineColorScheme,
   Container
} from '@mantine/core'
import { Outlet, useLocation, Link, useSearchParams } from 'react-router-dom'
import { useUserQuery } from '../../api/hooks/useUserQuery'
import { useLogoutMutation } from '../../api/hooks/useLogoutMutation'
import classes from './Layout.module.css'
import { useEffect } from 'react'
import { useTokenMutation } from '../../api/hooks/useTokenMutation'

const PROJECT_NAME = 'АРМ'

const NAV_ITEMS = [
   { to: '/', label: 'Счета' },
   { to: '/tariffs', label: 'Тарифы' },
   { to: '/users', label: 'Пользователи' }
] as const

export const Layout = () => {
   const [searchParams, setSearchParams] = useSearchParams()
   const { pathname } = useLocation()
   const user = useUserQuery()
   const logout = useLogoutMutation()
   const token = useTokenMutation()
   const { colorScheme, toggleColorScheme } = useMantineColorScheme()
   const code = searchParams.get('code')

   const displayName = user.data?.data?.displayName ?? user.data?.data?.username ?? 'Пользователь'
   useEffect(() => {
      if (user.isError && !code) {
         window.location.replace('http://localhost:4000/login?return_to=http://localhost:5173/')
      }
   }, [user.isError])

   useEffect(() => {
      if (code) {
         token.mutateAsync({ grant_type: 'authorization_code', code }).then(() => {
            setSearchParams(new URLSearchParams())
         })
      }
   }, [searchParams])

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
            <Container size="lg" p="md">
               <Outlet />
            </Container>
         </AppShell.Main>
      </AppShell>
   )
}
