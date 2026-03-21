import {
   AppShell,
   Group,
   Button,
   Text,
   UnstyledButton,
   ActionIcon,
   Tooltip,
   Menu,
   Container,
   Loader,
   Flex,
   Alert
} from '@mantine/core'
import { Outlet, useLocation, Link } from 'react-router-dom'
import classes from './Layout.module.css'
import { useAuth } from '../../../useCases/hooks/useAuth'
import { useColorScheme } from '../../../useCases/hooks/useColorScheme'

const PROJECT_NAME = 'АРМ'

const NAV_ITEMS = [
   { to: '/', label: 'Счета' },
   { to: '/tariffs', label: 'Тарифы' },
   { to: '/users', label: 'Пользователи' }
] as const

const colorSchemeIcon = {
   light: '☀️',
   dark: '🌙',
   auto: '💻'
}

export const Layout = () => {
   const { pathname } = useLocation()
   const { logout, user } = useAuth()
   const { colorScheme, setColorScheme } = useColorScheme()
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
                  <Menu position="bottom-end">
                     <Menu.Target>
                        <ActionIcon variant="light" size="lg" aria-label="Сменить тему">
                           {colorSchemeIcon[colorScheme]}
                        </ActionIcon>
                     </Menu.Target>
                     <Menu.Dropdown>
                        <Menu.Item onClick={() => setColorScheme('light')}>☀️ Светлая</Menu.Item>
                        <Menu.Item onClick={() => setColorScheme('dark')}>🌙 Тёмная</Menu.Item>
                        <Menu.Item onClick={() => setColorScheme('auto')}>💻 Системная</Menu.Item>
                     </Menu.Dropdown>
                  </Menu>
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
