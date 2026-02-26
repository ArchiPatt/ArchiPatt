import { Badge, Card, Group, Stack, Text } from '@mantine/core'
import type { CreditOverview } from '../../../generated/api/core/types.gen'
import { formatMoney } from '../../utils/formatMoney'
import { formatDate } from '../../utils/formatDate'

type CreditCardProps = {
   credit: CreditOverview
}

const getCreditStatusLabel = (status?: CreditOverview['status']) => {
   if (status === 'active') return 'Активен'
   if (status === 'closed') return 'Закрыт'
   if (status === 'defaulted') return 'Просрочен'

   return 'Неизвестен'
}

const getCreditStatusColor = (status?: CreditOverview['status']) => {
   if (status === 'active') return 'green'
   if (status === 'closed') return 'gray'
   if (status === 'defaulted') return 'red'

   return 'gray'
}

export const CreditCard = ({ credit }: CreditCardProps) => {
   return (
      <Card withBorder radius="md" padding="sm">
         <Group justify="space-between" align="flex-start">
            <Stack gap={2}>
               <Text size="sm" fw={500}>
                  Кредит № {credit.id}
               </Text>
               <Text size="xs" c="dimmed">
                  Выдан: {formatDate(credit.issuedAt)}
               </Text>
            </Stack>
            <Stack gap={4} align="flex-end">
               <Group gap="xs">
                  <Text size="xs" c="dimmed">
                     Сумма:
                  </Text>
                  <Text size="sm" fw={600}>
                     {formatMoney(credit.principalAmount)}
                  </Text>
               </Group>
               <Badge size="sm" color={getCreditStatusColor(credit.status)}>
                  {getCreditStatusLabel(credit.status)}
               </Badge>
            </Stack>
         </Group>
      </Card>
   )
}

