import {
   Alert,
   Badge,
   Card,
   Center,
   Flex,
   Grid,
   Group,
   Loader,
   Pagination,
   Progress,
   Stack,
   Text,
   Title,
   Tooltip
} from '@mantine/core'
import { AccountCard } from '../../components/Dashboard/AccountCard'
import { CreditCard } from '../../components/Dashboard/CreditCard'
import { useHome } from '../../../useCases/pages/useHome'

const getUserRoleLabel = (roles?: string[]) => {
   if (!roles || roles.length === 0) return 'Клиент'

   if (roles.includes('admin') || roles.includes('employee')) {
      return 'Сотрудник'
   }

   return 'Клиент'
}

export const Home = () => {
   const { state, functions } = useHome()

   if (state.isLoading) {
      return (
         <Center h="100%">
            <Loader />
         </Center>
      )
   }

   if (!state.dashboardData || state.dashboardData.items.length === 0) {
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
               Всего клиентов: {state.total}
            </Text>
         </Group>

         <Stack gap="lg">
            {state.dashboardData.items.map((item) => (
               <Card key={item.user.id} withBorder shadow="sm" radius="md" p="lg">
                  <Stack gap="md">
                     <Group justify="space-between" align="flex-start">
                        <Stack gap={4} w="100%">
                           <Flex justify="space-between" align="center" w="100%">
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
                              <Tooltip label={`Кредитный рейтинг: ${item.creditRating.score}`} withArrow>
                                 <Progress value={item.creditRating.score} w={100} />
                              </Tooltip>
                           </Flex>

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
                                       <AccountCard
                                          key={account.id}
                                          account={account}
                                          isHidden={state.hiddenAccounts.has(account.id)}
                                          onHide={functions.handleHideAccount}
                                          onShow={functions.handleShowAccount}
                                       />
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
               value={state.page}
               onChange={functions.handlePageChange}
               total={Math.max(state.totalPages, 1)}
               size="md"
               radius="md"
               withEdges
               withControls
               disabled={state.totalPages <= 1}
            />
         </Center>
      </Stack>
   )
}
