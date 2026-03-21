import { Alert, Button, CopyButton, Group, MultiSelect, Stack, TextInput } from '@mantine/core'
import { type ContextModalProps } from '@mantine/modals'
import { Controller } from 'react-hook-form'
import { useUserModal } from '../../../useCases/modals/useUserModal'

const ROLE_OPTIONS = [
   { value: 'client', label: 'Клиент' },
   { value: 'employee', label: 'Сотрудник' },
   { value: 'admin', label: 'Админ' }
]

export const CreateUserModal = ({ context, id }: ContextModalProps) => {
   const { state, functions } = useUserModal()

   if (state.createUser.data?.data.setupUrl) {
      return (
         <Stack>
            <Alert>
               Пользователь {state.createUser.data.data.username} успешно создан. Используйте ссылку ниже
               для настройки пароля.
            </Alert>
            <CopyButton value={state.createUser.data?.data.setupUrl}>
               {({ copied, copy }) => (
                  <Button color={copied ? 'teal' : 'blue'} onClick={copy}>
                     {copied ? 'Скопировано' : 'Копировать ссылку'}
                  </Button>
               )}
            </CopyButton>
         </Stack>
      )
   }

   return (
      <form onSubmit={functions.onSubmit}>
         <Stack gap="md">
            <Controller
               name="username"
               control={state.control}
               render={({ field }) => (
                  <TextInput
                     label="Логин"
                     placeholder="Введите логин"
                     withAsterisk
                     {...field}
                     error={state.errors.username?.message}
                  />
               )}
            />

            <Controller
               name="displayName"
               control={state.control}
               render={({ field }) => (
                  <TextInput
                     label="Отображаемое имя"
                     placeholder="Введите имя (необязательно)"
                     {...field}
                     error={state.errors.displayName?.message}
                  />
               )}
            />

            <Controller
               name="roles"
               control={state.control}
               render={({ field }) => (
                  <MultiSelect
                     label="Роли"
                     placeholder="Выберите роли"
                     data={ROLE_OPTIONS}
                     withAsterisk
                     {...field}
                     value={(field.value ?? []) as string[]}
                     error={state.errors.roles?.message}
                  />
               )}
            />

            <Group justify="flex-end" mt="md">
               <Button
                  variant="default"
                  onClick={() => context.closeModal(id)}
                  disabled={state.createUser.isPending}
               >
                  Отмена
               </Button>
               <Button type="submit" loading={state.createUser.isPending}>
                  Создать
               </Button>
            </Group>
         </Stack>
      </form>
   )
}
