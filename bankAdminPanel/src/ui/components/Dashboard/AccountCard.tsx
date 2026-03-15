import { Badge, Card, Group, Stack, Text } from '@mantine/core'
import { useNavigate } from 'react-router-dom'
import type { Account } from '../../../../generated/api/core/types.gen'
import { formatMoney } from '../../../utils/formatMoney'
import { formatDate } from '../../../utils/formatDate'

type AccountCardProps = {
   account: Account
}

export const AccountCard = ({ account }: AccountCardProps) => {
   const navigate = useNavigate()

   const handleClick = () => {
      navigate(`/accounts/${account.id}`)
   }

   return (
      <Card withBorder radius="md" padding="sm" style={{ cursor: 'pointer' }} onClick={handleClick}>
         <Group justify="space-between" align="flex-start">
            <Stack gap={2}>
               <Text size="sm" fw={500}>
                  Счёт № {account.id}
               </Text>
               <Text size="xs" c="dimmed">
                  Создан: {formatDate(account.createdAt)}
               </Text>
            </Stack>
            <Stack gap={4} align="flex-end">
               <Text size="sm" fw={600}>
                  {formatMoney(account.balance, account.currency)}
               </Text>
               <Badge size="sm" color={account.status === 'open' ? 'green' : 'gray'}>
                  {account.status === 'open' ? 'Открыт' : 'Закрыт'}
               </Badge>
            </Stack>
         </Group>
      </Card>
   )
}
