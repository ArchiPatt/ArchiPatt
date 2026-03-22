import {
   Alert,
   Badge,
   Button,
   Card,
   Center,
   Flex,
   Group,
   Loader,
   Progress,
   Stack,
   Text,
   Title,
   Tooltip
} from '@mantine/core'
import { formatDate } from '../../../utils/formatDate'
import classes from './Users.module.css'
import { useUsers } from '../../../useCases/pages/useUsers'
import { useCreditRatingQuery } from '../../../api/hooks/useCreditRatingQuery'

const getUserRoleLabel = (roles?: string[]) => {
   if (!roles || roles.length === 0) return 'Клиент'

   if (roles.includes('admin') || roles.includes('employee')) {
      return 'Сотрудник'
   }

   return 'Клиент'
}

type UserCardProps = {
   user: { id: string; displayName?: string | null; username?: string; roles?: string[]; createdAt?: string }
   isBlocked: boolean
   isCurrentUser: boolean
   onBlock: { mutate: (p: { id: string; isBlocked: boolean }) => void; isPending: boolean }
}

const UserCard = ({ user, isBlocked, isCurrentUser, onBlock }: UserCardProps) => {
   const ratingQuery = useCreditRatingQuery(user.id)

   return (
      <Card withBorder shadow="sm" radius="md" p="lg">
         <Flex
            direction={{ base: 'column', sm: 'row' }}
            gap="md"
            justify="space-between"
            align="flex-start"
         >
            <Stack gap={4} style={{ flex: 1, minWidth: 0 }}>
               <Group gap="xs" wrap="wrap" justify="space-between">
                  <Group gap="xs" wrap="wrap">
                     <Title order={3}>{user.displayName || user.username || 'Без имени'}</Title>
                     <Badge color="blue" variant="light">
                        {getUserRoleLabel(user.roles)}
                     </Badge>
                     {isBlocked && (
                        <Badge color="red" variant="light">
                           Заблокирован
                        </Badge>
                     )}
                  </Group>
                  {ratingQuery.data?.data && (
                     <Tooltip
                        label={`Кредитный рейтинг: ${ratingQuery.data.data.score} (просрочек: ${ratingQuery.data.data.overdueCount}, закрыто: ${ratingQuery.data.data.closedCount})`}
                        withArrow
                     >
                        <Progress
                           value={ratingQuery.data.data.score}
                           w={100}
                           size="sm"
                           color={ratingQuery.data.data.score >= 70 ? 'green' : ratingQuery.data.data.score >= 40 ? 'yellow' : 'red'}
                        />
                     </Tooltip>
                  )}
                  {ratingQuery.isLoading && <Loader size="xs" />}
               </Group>
               <Flex direction={{ base: 'column', sm: 'row' }} gap="sm" wrap="wrap">
                  <Text size="xs" c="dimmed">
                     Логин: {user.username}
                  </Text>
                  <Text size="xs" c="dimmed">
                     ID: {user.id}
                  </Text>
                  <Text size="xs" c="dimmed">
                     Создан: {formatDate(user.createdAt)}
                  </Text>
               </Flex>
            </Stack>

            <Button
               variant={isBlocked ? 'light' : 'outline'}
               color={isBlocked ? 'green' : 'red'}
               loading={onBlock.isPending}
               disabled={isCurrentUser}
               onClick={() =>
                  onBlock.mutate({
                     id: user.id,
                     isBlocked: !isBlocked
                  })
               }
               className={classes.blockButton}
            >
               {isBlocked ? 'Разблокировать' : 'Заблокировать'}
            </Button>
         </Flex>
      </Card>
   )
}

export const Users = () => {
   const { state, functions } = useUsers()

   if (state.isLoading) {
      return (
         <Center h="100%">
            <Loader />
         </Center>
      )
   }

   if (state.isError) {
      return (
         <Alert color="red" title="Ошибка">
            Не удалось загрузить пользователей
         </Alert>
      )
   }

   if (state.usersData?.length === 0) {
      return (
         <Alert color="blue" title="Пользователи">
            Пользователи не найдены
         </Alert>
      )
   }

   return (
      <Stack gap="lg">
         <Group justify="space-between">
            <Title order={2}>Пользователи</Title>
            <Group>
               <Text c="dimmed" size="sm">
                  Всего пользователей: {state.usersData?.length}
               </Text>
               <Button onClick={functions.handleOpenCreateUserModal}>Создать пользователя</Button>
            </Group>
         </Group>

         <Stack gap="md">
            {state.usersData?.map((user) => {
               const isBlocked = user.isBlocked
               const isCurrentUser = state.meData?.id === user.id

               return (
                  <UserCard
                     key={user.id}
                     user={user}
                     isBlocked={isBlocked}
                     isCurrentUser={isCurrentUser}
                     onBlock={state.blockUser}
                  />
               )
            })}
         </Stack>
      </Stack>
   )
}
