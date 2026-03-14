import {
   Alert,
   Badge,
   Card,
   Center,
   Divider,
   Group,
   Loader,
   Pagination,
   Stack,
   Table,
   Text,
   Title
} from '@mantine/core'
import { formatDate } from '../../../utils/formatDate'
import { formatMoney } from '../../../utils/formatMoney'
import { useAccountDetails } from '../../../useCases/pages/useAccountDetails'

const getStatusLabel = (status?: string) => {
   if (status === 'open') return 'Открыт'
   if (status === 'closed') return 'Закрыт'
   return 'Неизвестно'
}

const getStatusColor = (status?: string) => {
   if (status === 'open') return 'green'
   return 'gray'
}

const getOperationTypeLabel = (type?: string | null) => {
   if (type === 'deposit' || type === 'seed_deposit') return 'Пополнение'
   if (type === 'withdraw') return 'Списание'
   if (type === 'credit_issue') return 'Выдача кредита'
   if (type === 'credit_repayment') return 'Погашение кредита'
   return type || 'Операция'
}

export const AccountDetails = () => {
   const { state, functions } = useAccountDetails()

   if (state.isLoading) {
      return (
         <Center h="100%">
            <Loader />
         </Center>
      )
   }

   if (!state.account) {
      return (
         <Alert color="red" title="Ошибка">
            Счёт не найден
         </Alert>
      )
   }

   return (
      <Stack gap="lg">
         <Group justify="space-between">
            <Title order={2}>Счёт № {state.account.id}</Title>
            <Badge size="lg" color={getStatusColor(state.account.status)}>
               {getStatusLabel(state.account.status)}
            </Badge>
         </Group>

         <Card withBorder shadow="sm" radius="md" p="lg">
            <Title order={4} mb="md">
               Информация о счёте
            </Title>
            <Stack gap="sm">
               <Group justify="space-between">
                  <Text c="dimmed">ID счёта:</Text>
                  <Text fw={500}>{state.account.id}</Text>
               </Group>
               <Group justify="space-between">
                  <Text c="dimmed">ID клиента:</Text>
                  <Text fw={500}>{state.account.clientId}</Text>
               </Group>
               <Divider />
               <Group justify="space-between">
                  <Text c="dimmed">Баланс:</Text>
                  <Text fw={700} size="lg" c="blue">
                     {formatMoney(state.account.balance)}
                  </Text>
               </Group>
               <Divider />
               <Group justify="space-between">
                  <Text c="dimmed">Дата создания:</Text>
                  <Text fw={500}>{formatDate(state.account.createdAt)}</Text>
               </Group>
               <Group justify="space-between">
                  <Text c="dimmed">Статус:</Text>
                  <Badge color={getStatusColor(state.account.status)}>
                     {getStatusLabel(state.account.status)}
                  </Badge>
               </Group>
            </Stack>
         </Card>

         <Card withBorder shadow="sm" radius="md" p="lg">
            <Title order={4} mb="md">
               История операций
            </Title>
            {state.operations.length === 0 ? (
               <Text c="dimmed" ta="center" py="xl">
                  История операций пуста
               </Text>
            ) : (
               <Table striped highlightOnHover>
                  <Table.Thead>
                     <Table.Tr>
                        <Table.Th>ID операции</Table.Th>
                        <Table.Th>Тип</Table.Th>
                        <Table.Th>Сумма</Table.Th>
                        <Table.Th>Дата</Table.Th>
                     </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                     {state.operations.map((op) => (
                        <Table.Tr key={op.id}>
                           <Table.Td>
                              <Text size="sm">{op.id}</Text>
                           </Table.Td>
                           <Table.Td>
                              <Badge color={Number(op.amount) >= 0 ? 'green' : 'red'} variant="light">
                                 {getOperationTypeLabel(op.type)}
                              </Badge>
                           </Table.Td>
                           <Table.Td>
                              <Text fw={600} c={Number(op.amount) >= 0 ? 'green' : 'red'}>
                                 {Number(op.amount) >= 0 ? '+' : ''}
                                 {formatMoney(op.amount)}
                              </Text>
                           </Table.Td>
                           <Table.Td>
                              <Text size="sm" c="dimmed">
                                 {formatDate(op.createdAt)}
                              </Text>
                           </Table.Td>
                        </Table.Tr>
                     ))}
                  </Table.Tbody>
               </Table>
            )}
            {state.total > state.defaultLimit && (
               <Group justify="space-between" mt="md">
                  <Text size="sm" c="dimmed">
                     Всего операций: {state.total}
                  </Text>
                  <Pagination
                     value={state.page}
                     onChange={functions.handlePageChange}
                     total={state.totalPages}
                  />
               </Group>
            )}
         </Card>
      </Stack>
   )
}
