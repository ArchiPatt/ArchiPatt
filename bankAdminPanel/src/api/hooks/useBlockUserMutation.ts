import { useMutation, useQueryClient } from '@tanstack/react-query'
import { notifications } from '@mantine/notifications'
import { patchUserByIdBlock } from '../../../generated/api/user/requests/users/patchUserByIdBlock.gen'
import type { PatchUsersByIdBlockData } from '../../../generated/api/user/types.gen'

type BlockUserVariables = {
   id: string
   isBlocked: boolean
}

export const useBlockUserMutation = () => {
   const queryClient = useQueryClient()

   return useMutation({
      mutationFn: ({ id, isBlocked }: BlockUserVariables) =>
         patchUserByIdBlock({
            path: { id },
            body: { isBlocked } as PatchUsersByIdBlockData['body']
         }),
      onSuccess: (response) => {
         const data = response.data as { username?: string; isBlocked?: boolean }

         const isBlocked = data.isBlocked ?? false
         const username = data.username ?? 'Пользователь'

         notifications.show({
            color: isBlocked ? 'red' : 'green',
            title: 'Успешно',
            message: isBlocked
               ? `Пользователь ${username} заблокирован`
               : `Пользователь ${username} разблокирован`
         })

         queryClient.invalidateQueries({ queryKey: ['users'] })
      },
      onError: (_error, variables) => {
         const action = variables.isBlocked ? 'заблокировать' : 'разблокировать'

         notifications.show({
            color: 'red',
            title: 'Ошибка',
            message: `Не удалось ${action} пользователя`
         })
      }
   })
}

