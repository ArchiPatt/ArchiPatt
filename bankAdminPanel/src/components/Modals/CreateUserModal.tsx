import { Alert, Button, CopyButton, Group, MultiSelect, Stack, TextInput } from '@mantine/core'
import { type ContextModalProps } from '@mantine/modals'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useCreateUserMutation } from '../../api/hooks/useCreateUserMutation'

const schema = yup.object({
   username: yup.string().required('Логин обязателен').min(3, 'Минимум 3 символа'),
   displayName: yup.string().optional(),
   roles: yup
      .array()
      .of(yup.string())
      .required('Выберите хотя бы одну роль')
      .min(1, 'Выберите хотя бы одну роль')
})

const ROLE_OPTIONS = [
   { value: 'client', label: 'Клиент' },
   { value: 'employee', label: 'Сотрудник' },
   { value: 'admin', label: 'Админ' }
]

export const CreateUserModal = ({ context, id }: ContextModalProps) => {
   const createUser = useCreateUserMutation()
   const {
      control,
      handleSubmit,
      formState: { errors }
   } = useForm({
      resolver: yupResolver(schema),
      defaultValues: {
         username: '',
         displayName: '',
         roles: ['client']
      }
   })

   const onSubmit = handleSubmit((values) => {
      createUser.mutate({
         username: values.username,
         displayName: values.displayName || null,
         roles: values.roles as string[]
      })
   })

   if (createUser.data?.data.setupUrl) {
      return (
         <Stack>
            <Alert>
               Пользователь {createUser.data.data.username} успешно создан. Используйте ссылку ниже для
               настройки пароля.
            </Alert>
            <CopyButton value={createUser.data?.data.setupUrl}>
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
      <form onSubmit={onSubmit}>
         <Stack gap="md">
            <Controller
               name="username"
               control={control}
               render={({ field }) => (
                  <TextInput
                     label="Логин"
                     placeholder="Введите логин"
                     withAsterisk
                     {...field}
                     error={errors.username?.message}
                  />
               )}
            />

            <Controller
               name="displayName"
               control={control}
               render={({ field }) => (
                  <TextInput
                     label="Отображаемое имя"
                     placeholder="Введите имя (необязательно)"
                     {...field}
                     error={errors.displayName?.message}
                  />
               )}
            />

            <Controller
               name="roles"
               control={control}
               render={({ field }) => (
                  <MultiSelect
                     label="Роли"
                     placeholder="Выберите роли"
                     data={ROLE_OPTIONS}
                     withAsterisk
                     {...field}
                     value={(field.value ?? []) as string[]}
                     error={errors.roles?.message}
                  />
               )}
            />

            <Group justify="flex-end" mt="md">
               <Button
                  variant="default"
                  onClick={() => context.closeModal(id)}
                  disabled={createUser.isPending}
               >
                  Отмена
               </Button>
               <Button type="submit" loading={createUser.isPending}>
                  Создать
               </Button>
            </Group>
         </Stack>
      </form>
   )
}
