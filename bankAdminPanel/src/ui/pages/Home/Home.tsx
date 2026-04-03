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
import { useUserQuery } from '../../../api/hooks/useUserQuery'
import { useStaffGlobalOperationsWS } from '../../../api/hooks/useStaffGlobalOperationsWS'

const getUserRoleLabel = (roles?: string[]) => {
   if (!roles || roles.length === 0) return 'Клиент'

   if (roles.includes('admin') || roles.includes('employee')) {
      return 'Сотрудник'
   }

   return 'Клиент'
}

export const Home = () => {
   const { state, functions } = useHome()
   const user = useUserQuery()
   const isStaff = user.data?.data.roles.includes('employee') || user.data?.data.roles.includes('admin')
   const globalFeed = useStaffGlobalOperationsWS(Boolean(isStaff && user.isSuccess))

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

         {isStaff && (
            <Card withBorder shadow="xs" radius="md" p="md">
               <Stack gap="xs">
                  <Title order={4}>Операции по всем счетам (live)</Title>
                  {globalFeed.isLoading ? (
                     <Loader size="sm" />
                  ) : globalFeed.error ? (
                     <Text size="sm" c="red">
                        Не удалось подключиться к потоку операций
                     </Text>
                  ) : globalFeed.operations.length === 0 ? (
                     <Text size="sm" c="dimmed">
                        Ожидание операций…
                     </Text>
                  ) : (
                     <Stack gap={4} style={{ maxHeight: 220, overflowY: 'auto', fontSize: 12 }}>
                        {globalFeed.operations.slice(0, 40).map((op) => (
                           <Group key={op.id} justify="space-between" wrap="nowrap" gap="xs">
                              <Text truncate style={{ flex: 1 }} c="dimmed">
                                 {op.createdAt?.slice(0, 19)} · счёт {op.accountId.slice(0, 8)}…
                              </Text>
                              <Text fw={600} style={{ whiteSpace: 'nowrap' }}>
                                 {op.amount} {op.type ? `· ${op.type}` : ''}
                              </Text>
                           </Group>
                        ))}
                     </Stack>
                  )}
               </Stack>
            </Card>
         )}

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
