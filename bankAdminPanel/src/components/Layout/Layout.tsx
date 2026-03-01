import {
   AppShell,
   Group,
   Button,
   Text,
   UnstyledButton,
   ActionIcon,
   Tooltip,
   useMantineColorScheme,
   Container,
   Loader,
   Flex,
   Alert
} from '@mantine/core'
import { Outlet, useLocation, Link } from 'react-router-dom'
import classes from './Layout.module.css'
import { useAuth } from './useAuth'

const PROJECT_NAME = 'АРМ'

const NAV_ITEMS = [
   { to: '/', label: 'Счета' },
   { to: '/tariffs', label: 'Тарифы' },
   { to: '/users', label: 'Пользователи' }
] as const

export const Layout = () => {
   const { pathname } = useLocation()
   const { logout, user } = useAuth()

   const { colorScheme, toggleColorScheme } = useMantineColorScheme()

   const displayName = user.data?.data?.displayName ?? user.data?.data?.username ?? 'Пользователь'

   if (user.isLoading) {
      return (
         <Flex justify="center" align="center">
            <Loader />
         </Flex>
      )
   }

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
            {!user.isLoading &&
            (user.data?.data.roles.includes('employee') || user.data?.data.roles.includes('admin')) ? (
               <Container size="lg" p="md">
                  <Outlet />
               </Container>
            ) : (
               <Container size="lg" p="md">
                  <Alert>
                     <Text ta="center">Недостаточно прав</Text>
                  </Alert>
               </Container>
            )}
         </AppShell.Main>
      </AppShell>
   )
}
