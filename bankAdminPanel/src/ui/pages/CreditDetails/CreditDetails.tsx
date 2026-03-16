import {
   Alert,
   Badge,
   Card,
   Center,
   Divider,
   Grid,
   Group,
   Loader,
   Stack,
   Table,
   Text,
   Title
} from '@mantine/core'
import { formatDate } from '../../../utils/formatDate'
import { formatMoney } from '../../../utils/formatMoney'
import { useCreditDetails } from '../../../useCases/pages/useCreditDetails'

const getStatusLabel = (status?: string) => {
   if (status === 'active') return 'Активен'
   if (status === 'closed') return 'Закрыт'
   if (status === 'defaulted') return 'Просрочен'
   return 'Неизвестно'
}

const getStatusColor = (status?: string) => {
   if (status === 'active') return 'green'
   if (status === 'closed') return 'gray'
   if (status === 'defaulted') return 'red'
   return 'gray'
}

const getPaymentTypeLabel = (type?: string) => {
   if (type === 'issue') return 'Выдача'
   if (type === 'repayment') return 'Платёж'
   if (type === 'accrual') return 'Начисление %'
   return type || 'Операция'
}

const getPaymentTypeColor = (type?: string) => {
   if (type === 'issue') return 'blue'
   if (type === 'repayment') return 'green'
   if (type === 'accrual') return 'orange'
   return 'gray'
}

export const CreditDetails = () => {
   const { state } = useCreditDetails()

   if (state.isLoading) {
      return (
         <Center h="100%">
            <Loader />
         </Center>
      )
   }

   if (!state.credit) {
      return (
         <Alert color="red" title="Ошибка">
            Кредит не найден
         </Alert>
      )
   }

   return (
      <Stack gap="lg">
         <Group justify="space-between">
            <Title order={2}>Кредит № {state.credit.id}</Title>
            <Badge size="lg" color={getStatusColor(state.credit.status)}>
               {getStatusLabel(state.credit.status)}
            </Badge>
         </Group>

         <Grid>
            <Grid.Col span={{ base: 12, md: 8 }}>
               <Card withBorder shadow="sm" radius="md" p="lg" h="100%">
                  <Title order={4} mb="md">
                     Информация о кредите
                  </Title>
                  <Stack gap="sm">
                     <Group justify="space-between">
                        <Text c="dimmed">ID кредита:</Text>
                        <Text fw={500}>{state.credit.id}</Text>
                     </Group>
                     <Group justify="space-between">
                        <Text c="dimmed">ID клиента:</Text>
                        <Text fw={500}>{state.credit.clientId}</Text>
                     </Group>
                     <Group justify="space-between">
                        <Text c="dimmed">ID счёта:</Text>
                        <Text fw={500}>{state.credit.accountId}</Text>
                     </Group>
                     <Divider />
                     <Group justify="space-between">
                        <Text c="dimmed">Сумма кредита:</Text>
                        <Text fw={700} size="lg">
                           {formatMoney(state.credit.principalAmount)}
                        </Text>
                     </Group>
                     <Group justify="space-between">
                        <Text c="dimmed">Остаток долга:</Text>
                        <Text fw={700} size="lg" c="red">
                           {formatMoney(state.credit.outstandingAmount)}
                        </Text>
                     </Group>
                     <Group justify="space-between">
                        <Text c="dimmed">Погашено:</Text>
                        <Text fw={600} c="green">
                           {state.progressPercent.toFixed(1)}%
                        </Text>
                     </Group>
                     <Divider />
                     <Group justify="space-between">
                        <Text c="dimmed">Дата выдачи:</Text>
                        <Text fw={500}>{formatDate(state.credit.issuedAt)}</Text>
                     </Group>
                     {state.credit.nextPaymentDueAt && (
                        <Group justify="space-between">
                           <Text c="dimmed">След. платёж:</Text>
                           <Text fw={500}>{formatDate(state.credit.nextPaymentDueAt)}</Text>
                        </Group>
                     )}
                     {state.credit.closedAt && (
                        <Group justify="space-between">
                           <Text c="dimmed">Дата закрытия:</Text>
                           <Text fw={500}>{formatDate(state.credit.closedAt)}</Text>
                        </Group>
                     )}
                     <Group justify="space-between">
                        <Text c="dimmed">Статус:</Text>
                        <Badge color={getStatusColor(state.credit.status)}>
                           {getStatusLabel(state.credit.status)}
                        </Badge>
                     </Group>
                  </Stack>
               </Card>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 4 }}>
               <Card withBorder shadow="sm" radius="md" p="lg" h="100%">
                  <Title order={4} mb="md">
                     Тариф
                  </Title>
                  {state.tariff ? (
                     <Stack gap="sm">
                        <Group justify="space-between">
                           <Text c="dimmed">Название:</Text>
                           <Text fw={600}>{state.tariff.name}</Text>
                        </Group>
                        <Divider />
                        <Group justify="space-between">
                           <Text c="dimmed">Ставка:</Text>
                           <Text fw={700} size="lg" c="orange">
                              {(Number(state.tariff.interestRate) * 100).toFixed(2)}%
                           </Text>
                        </Group>
                        <Group justify="space-between">
                           <Text c="dimmed">Период:</Text>
                           <Text fw={500}>{state.tariff.billingPeriodDays} дн.</Text>
                        </Group>
                        <Group justify="space-between">
                           <Text c="dimmed">Активен:</Text>
                           <Badge color={state.tariff.isActive ? 'green' : 'gray'}>
                              {state.tariff.isActive ? 'Да' : 'Нет'}
                           </Badge>
                        </Group>
                        <Divider />
                        <Text size="xs" c="dimmed">
                           Ставка {state.tariff.interestRate} начисляется каждые{' '}
                           {state.tariff.billingPeriodDays} дней
                        </Text>
                     </Stack>
                  ) : (
                     <Text c="dimmed" ta="center">
                        Информация о тарифе недоступна
                     </Text>
                  )}
               </Card>
            </Grid.Col>
         </Grid>

         {state.overduePayments.length > 0 && (
            <Alert color="red" title="Просроченные платежи" icon={null}>
               <Stack gap="xs">
                  {state.overduePayments.map((overdue) => (
                     <Group key={overdue.creditId + overdue.dueDate} justify="space-between">
                        <Group gap="xs">
                           <Badge color="red" variant="filled">
                              {overdue.daysOverdue} дн. просрочки
                           </Badge>
                           <Text size="sm">Дата платежа: {formatDate(overdue.dueDate)}</Text>
                        </Group>
                        <Text fw={700} c="red">
                           Остаток: {formatMoney(overdue.outstandingAmount)}
                        </Text>
                     </Group>
                  ))}
               </Stack>
            </Alert>
         )}

         <Card withBorder shadow="sm" radius="md" p="lg">
            <Title order={4} mb="md">
               История платежей
            </Title>
            {state.payments.length === 0 ? (
               <Text c="dimmed" ta="center" py="xl">
                  История платежей пуста
               </Text>
            ) : (
               <Table striped highlightOnHover>
                  <Table.Thead>
                     <Table.Tr>
                        <Table.Th>ID</Table.Th>
                        <Table.Th>Тип</Table.Th>
                        <Table.Th>Сумма</Table.Th>
                        <Table.Th>Инициатор</Table.Th>
                        <Table.Th>Дата</Table.Th>
                     </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                     {state.payments.map((payment) => (
                        <Table.Tr key={payment.id}>
                           <Table.Td>
                              <Text size="sm">{payment.id}</Text>
                           </Table.Td>
                           <Table.Td>
                              <Badge color={getPaymentTypeColor(payment.paymentType)} variant="light">
                                 {getPaymentTypeLabel(payment.paymentType)}
                              </Badge>
                           </Table.Td>
                           <Table.Td>
                              <Text
                                 fw={600}
                                 c={
                                    payment.paymentType === 'issue'
                                       ? 'blue'
                                       : payment.paymentType === 'repayment'
                                         ? 'green'
                                         : 'orange'
                                 }
                              >
                                 {payment.paymentType === 'issue' ? '+' : '-'}
                                 {formatMoney(payment.amount)}
                              </Text>
                           </Table.Td>
                           <Table.Td>
                              <Text size="sm" c="dimmed">
                                 {payment.performedBy}
                              </Text>
                           </Table.Td>
                           <Table.Td>
                              <Text size="sm" c="dimmed">
                                 {formatDate(payment.performedAt)}
                              </Text>
                           </Table.Td>
                        </Table.Tr>
                     ))}
                  </Table.Tbody>
               </Table>
            )}
         </Card>
      </Stack>
   )
}
