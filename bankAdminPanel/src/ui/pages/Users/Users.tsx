import {
   Alert,
   Badge,
   Button,
   Card,
   Center,
   Flex,
   Group,
   Loader,
   Stack,
   Text,
   Title
} from '@mantine/core'
import { modals } from '@mantine/modals'
import { useUsersQuery } from '../../../api/hooks/useUsersQuery'
import { useBlockUserMutation } from '../../../api/hooks/useBlockUserMutation'
import { formatDate } from '../../../utils/formatDate'
import { useUserQuery } from '../../../api/hooks/useUserQuery'
import classes from './Users.module.css'

const getUserRoleLabel = (roles?: string[]) => {
   if (!roles || roles.length === 0) return 'Клиент'

   if (roles.includes('admin') || roles.includes('employee')) {
      return 'Сотрудник'
   }

   return 'Клиент'
}

export const Users = () => {
   const usersQuery = useUsersQuery()
   const blockUser = useBlockUserMutation()
   const meQuery = useUserQuery()

   const currentUserId = meQuery.data?.data.id

   const handleOpenCreateUserModal = () => {
      modals.openContextModal({ modal: 'createUser', title: 'Создать пользователя', innerProps: {} })
   }

   if (usersQuery.isLoading) {
      return (
         <Center h="100%">
            <Loader />
         </Center>
      )
   }

   if (usersQuery.isError) {
      return (
         <Alert color="red" title="Ошибка">
            Не удалось загрузить пользователей
         </Alert>
      )
   }

   const users = usersQuery.data?.data ?? []

   if (users.length === 0) {
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
                  Всего пользователей: {users.length}
               </Text>
               <Button onClick={handleOpenCreateUserModal}>Создать пользователя</Button>
            </Group>
         </Group>

         <Stack gap="md">
            {users.map((user) => {
               const isBlocked = user.isBlocked
               const isCurrentUser = currentUserId === user.id

               return (
                  <Card key={user.id} withBorder shadow="sm" radius="md" p="lg">
                     <Flex
                        direction={{ base: 'column', sm: 'row' }}
                        gap="md"
                        justify="space-between"
                        align="flex-start"
                     >
                        <Stack gap={4} style={{ flex: 1, minWidth: 0 }}>
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
                           loading={blockUser.isPending}
                           disabled={isCurrentUser}
                           onClick={() =>
                              blockUser.mutate({
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
            })}
         </Stack>
      </Stack>
   )
}
