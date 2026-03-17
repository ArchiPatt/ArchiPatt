import { useMutation, useQueryClient } from '@tanstack/react-query'
import { notifications } from '@mantine/notifications'
import { postUsers } from '../../../generated/api/user/requests/users/postUsers.gen'
import type { PostUsersData } from '../../../generated/api/user/types.gen'

export const useCreateUserMutation = () => {
   const queryClient = useQueryClient()

   return useMutation({
      mutationFn: (data: PostUsersData['body']) =>
         postUsers({
            body: data
         }),
      onSuccess: (response) => {
         const data = response.data as { username?: string; setupUrl?: string | null }

         notifications.show({
            color: 'green',
            title: 'Успешно',
            message: `Пользователь ${data.username} создан`
         })

         queryClient.invalidateQueries({ queryKey: ['users'] })
      },
      onError: () => {
         notifications.show({
            color: 'red',
            title: 'Ошибка',
            message: 'Не удалось создать пользователя'
         })
      }
   })
}
