import {
   Alert,
   Badge,
   Card,
   Center,
   Grid,
   Group,
   Loader,
   Pagination,
   Stack,
   Text,
   Title
} from '@mantine/core'
import { useSearchParams } from 'react-router-dom'
import { useDashboardClientsOverviewQuery } from '../../api/hooks/useDashboardClientsOverviewQuery'
import { AccountCard } from '../../components/Dashboard/AccountCard'
import { CreditCard } from '../../components/Dashboard/CreditCard'

const DEFAULT_LIMIT = 10

const getUserRoleLabel = (roles?: string[]) => {
   if (!roles || roles.length === 0) return 'Клиент'

   if (roles.includes('admin') || roles.includes('employee')) {
      return 'Сотрудник'
   }

   return 'Клиент'
}

export const Home = () => {
   const [searchParams, setSearchParams] = useSearchParams()

   const pageParam = Number(searchParams.get('page') || '1')
   const limitParam = Number(searchParams.get('limit') || `${DEFAULT_LIMIT}`)

   const page = Number.isNaN(pageParam) || pageParam < 1 ? 1 : pageParam
   const limit = Number.isNaN(limitParam) || limitParam <= 0 ? DEFAULT_LIMIT : limitParam

   const offset = (page - 1) * limit

   const dashboardQuery = useDashboardClientsOverviewQuery({ limit, offset })

   const total = dashboardQuery.data?.data?.total ?? 0
   const totalPages = total > 0 ? Math.ceil(total / limit) : 1

   const handlePageChange = (nextPage: number) => {
      setSearchParams((prev) => {
         const next = new URLSearchParams(prev)

         next.set('page', String(nextPage))
         next.set('limit', String(limit))

         return next
      })
   }

   if (dashboardQuery.isLoading) {
      return (
         <Center h="100%">
            <Loader />
         </Center>
      )
   }

   if (!dashboardQuery.data || dashboardQuery.data.data.items.length === 0) {
      return (
         <Alert color="blue" title="Главная страница">
            Клиенты не найдены
         </Alert>
      )
   }

   return (
      <Stack gap="lg">
         <Group justify="space-between">
            <Title order={2}>Обзор клиентов</Title>
            <Text c="dimmed" size="sm">
               Всего клиентов: {total}
            </Text>
         </Group>

         <Stack gap="lg">
            {dashboardQuery.data.data.items.map((item) => (
               <Card key={item.user.id} withBorder shadow="sm" radius="md" p="lg">
                  <Stack gap="md">
                     <Group justify="space-between" align="flex-start">
                        <Stack gap={4}>
                           <Group gap="xs">
                              <Title order={3}>
                                 {item.user.displayName || item.user.username || 'Без имени'}
                              </Title>
                              {item.user.isBlocked && (
                                 <Badge color="red" variant="light">
                                    Заблокирован
                                 </Badge>
                              )}
                           </Group>
                           <Group gap="sm">
                              <Badge color="blue" variant="light">
                                 {getUserRoleLabel(item.user.roles)}
                              </Badge>
                              {item.user.id && (
                                 <Text size="xs" c="dimmed">
                                    ID: {item.user.id}
                                 </Text>
                              )}
                           </Group>
                        </Stack>
                     </Group>

                     <Grid gutter="lg">
                        <Grid.Col span={{ base: 12, lg: 6 }}>
                           <Stack gap="xs">
                              <Group justify="space-between" align="center">
                                 <Title order={4}>Счета</Title>
                                 <Text size="sm" c="dimmed">
                                    Всего: {item.accounts.length}
                                 </Text>
                              </Group>
                              {item.accounts.length === 0 ? (
                                 <Text size="sm" c="dimmed">
                                    Счета отсутствуют
                                 </Text>
                              ) : (
                                 <Stack gap="xs">
                                    {item.accounts.map((account) => (
                                       <AccountCard key={account.id} account={account} />
                                    ))}
                                 </Stack>
                              )}
                           </Stack>
                        </Grid.Col>

                        <Grid.Col span={{ base: 12, lg: 6 }}>
                           <Stack gap="xs">
                              <Group justify="space-between" align="center">
                                 <Title order={4}>Кредиты</Title>
                                 <Text size="sm" c="dimmed">
                                    Всего: {item.credits.length}
                                 </Text>
                              </Group>
                              {item.credits.length === 0 ? (
                                 <Text size="sm" c="dimmed">
                                    Кредиты отсутствуют
                                 </Text>
                              ) : (
                                 <Stack gap="xs">
                                    {item.credits.map((credit) => (
                                       <CreditCard key={credit.id} credit={credit} />
                                    ))}
                                 </Stack>
                              )}
                           </Stack>
                        </Grid.Col>
                     </Grid>
                  </Stack>
               </Card>
            ))}
         </Stack>

         <Center>
            <Pagination
               value={page}
               onChange={handlePageChange}
               total={Math.max(totalPages, 1)}
               size="md"
               radius="md"
               withEdges
               withControls
               disabled={totalPages <= 1}
            />
         </Center>
      </Stack>
   )
}
