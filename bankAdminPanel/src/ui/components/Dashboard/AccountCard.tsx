import { ActionIcon, Badge, Card, Group, Stack, Text, Tooltip } from '@mantine/core'
import { IconEyeOff, IconEye } from '@tabler/icons-react'
import { useNavigate } from 'react-router-dom'
import type { Account } from '../../../../generated/api/core/types.gen'
import { formatMoney } from '../../../utils/formatMoney'
import { formatDate } from '../../../utils/formatDate'
import { maskAccountId } from '../../../utils/maskAccountId'

type AccountCardProps = {
   account: Account
   isHidden?: boolean
   onHide?: (accountId: string) => void
   onShow?: (accountId: string) => void
}

export const AccountCard = ({ account, isHidden, onHide, onShow }: AccountCardProps) => {
   const navigate = useNavigate()

   const handleClick = () => {
      navigate(`/accounts/${account.id}`)
   }

   const handleToggleVisibility = (e: React.MouseEvent) => {
      e.stopPropagation()
      if (isHidden && onShow) {
         onShow(account.id)
      } else if (!isHidden && onHide) {
         onHide(account.id)
      }
   }

   return (
      <Card
         withBorder
         radius="md"
         padding="sm"
         style={{
            cursor: 'pointer',
            opacity: isHidden ? 0.6 : 1,
            backgroundColor: isHidden ? 'var(--mantine-color-gray)' : undefined
         }}
         onClick={handleClick}
      >
         <Group justify="space-between" align="flex-start">
            <Stack gap={2}>
               <Group gap="xs">
                  <Tooltip label={`Счёт № ${account.id}`} withArrow>
                     <Text size="sm" fw={500}>
                        Счёт № {maskAccountId(account.id)}
                     </Text>
                  </Tooltip>
                  {isHidden && (
                     <Badge size="xs" color="gray" variant="light">
                        Скрыт
                     </Badge>
                  )}
               </Group>
               <Text size="xs" c="dimmed">
                  Создан: {formatDate(account.createdAt)}
               </Text>
            </Stack>
            <Group gap="xs" align="flex-start">
               <Stack gap={4} align="flex-end">
                  <Text size="sm" fw={600}>
                     {formatMoney(account.balance, account.currency)}
                  </Text>
                  <Badge size="sm" color={account.status === 'open' ? 'green' : 'gray'}>
                     {account.status === 'open' ? 'Открыт' : 'Закрыт'}
                  </Badge>
               </Stack>
               <Tooltip label={isHidden ? 'Показать счёт' : 'Скрыть счёт'} withArrow>
                  <ActionIcon
                     variant="subtle"
                     color={isHidden ? 'blue' : 'gray'}
                     onClick={handleToggleVisibility}
                  >
                     {isHidden ? <IconEye size={16} /> : <IconEyeOff size={16} />}
                  </ActionIcon>
               </Tooltip>
            </Group>
         </Group>
      </Card>
   )
}
