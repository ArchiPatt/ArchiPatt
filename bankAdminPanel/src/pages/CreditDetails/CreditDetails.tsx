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
import { useParams } from 'react-router-dom'
import { useCreditByIdQuery } from '../../api/hooks/useCreditByIdQuery'
import { useCreditPaymentsQuery } from '../../api/hooks/useCreditPaymentsQuery'
import { useTariffByIdQuery } from '../../api/hooks/useTariffByIdQuery'
import { formatDate } from '../../utils/formatDate'
import { formatMoney } from '../../utils/formatMoney'

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
   const { id } = useParams<{ id: string }>()

   const creditQuery = useCreditByIdQuery(id)
   const paymentsQuery = useCreditPaymentsQuery(id)
   const tariffQuery = useTariffByIdQuery(creditQuery.data?.data?.tariffId)

   const isLoading = creditQuery.isLoading || paymentsQuery.isLoading
   const credit = creditQuery.data?.data
   const payments = paymentsQuery.data?.data ?? []
   const tariff = tariffQuery.data

   if (isLoading) {
      return (
         <Center h="100%">
            <Loader />
         </Center>
      )
   }

   if (!credit) {
      return (
         <Alert color="red" title="Ошибка">
            Кредит не найден
         </Alert>
      )
   }

   const principalAmount = Number(credit.principalAmount)
   const outstandingAmount = Number(credit.outstandingAmount)
   const progressPercent =
      principalAmount > 0
         ? Math.max(0, Math.min(100, ((principalAmount - outstandingAmount) / principalAmount) * 100))
         : 0

   return (
      <Stack gap="lg">
         <Group justify="space-between">
            <Title order={2}>Кредит № {credit.id}</Title>
            <Badge size="lg" color={getStatusColor(credit.status)}>
               {getStatusLabel(credit.status)}
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
                        <Text fw={500}>{credit.id}</Text>
                     </Group>
                     <Group justify="space-between">
                        <Text c="dimmed">ID клиента:</Text>
                        <Text fw={500}>{credit.clientId}</Text>
                     </Group>
                     <Group justify="space-between">
                        <Text c="dimmed">ID счёта:</Text>
                        <Text fw={500}>{credit.accountId}</Text>
                     </Group>
                     <Divider />
                     <Group justify="space-between">
                        <Text c="dimmed">Сумма кредита:</Text>
                        <Text fw={700} size="lg">
                           {formatMoney(credit.principalAmount)}
                        </Text>
                     </Group>
                     <Group justify="space-between">
                        <Text c="dimmed">Остаток долга:</Text>
                        <Text fw={700} size="lg" c="red">
                           {formatMoney(credit.outstandingAmount)}
                        </Text>
                     </Group>
                     <Group justify="space-between">
                        <Text c="dimmed">Погашено:</Text>
                        <Text fw={600} c="green">
                           {progressPercent.toFixed(1)}%
                        </Text>
                     </Group>
                     <Divider />
                     <Group justify="space-between">
                        <Text c="dimmed">Дата выдачи:</Text>
                        <Text fw={500}>{formatDate(credit.issuedAt)}</Text>
                     </Group>
                     {credit.nextPaymentDueAt && (
                        <Group justify="space-between">
                           <Text c="dimmed">След. платёж:</Text>
                           <Text fw={500}>{formatDate(credit.nextPaymentDueAt)}</Text>
                        </Group>
                     )}
                     {credit.closedAt && (
                        <Group justify="space-between">
                           <Text c="dimmed">Дата закрытия:</Text>
                           <Text fw={500}>{formatDate(credit.closedAt)}</Text>
                        </Group>
                     )}
                     <Group justify="space-between">
                        <Text c="dimmed">Статус:</Text>
                        <Badge color={getStatusColor(credit.status)}>
                           {getStatusLabel(credit.status)}
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
                  {tariff ? (
                     <Stack gap="sm">
                        <Group justify="space-between">
                           <Text c="dimmed">Название:</Text>
                           <Text fw={600}>{tariff.name}</Text>
                        </Group>
                        <Divider />
                        <Group justify="space-between">
                           <Text c="dimmed">Ставка:</Text>
                           <Text fw={700} size="lg" c="orange">
                              {(Number(tariff.interestRate) * 100).toFixed(2)}%
                           </Text>
                        </Group>
                        <Group justify="space-between">
                           <Text c="dimmed">Период:</Text>
                           <Text fw={500}>{tariff.billingPeriodDays} дн.</Text>
                        </Group>
                        <Group justify="space-between">
                           <Text c="dimmed">Активен:</Text>
                           <Badge color={tariff.isActive ? 'green' : 'gray'}>
                              {tariff.isActive ? 'Да' : 'Нет'}
                           </Badge>
                        </Group>
                        <Divider />
                        <Text size="xs" c="dimmed">
                           Ставка {tariff.interestRate} начисляется каждые {tariff.billingPeriodDays}{' '}
                           дней
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

         <Card withBorder shadow="sm" radius="md" p="lg">
            <Title order={4} mb="md">
               История платежей
            </Title>
            {payments.length === 0 ? (
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
                     {payments.map((payment) => (
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
