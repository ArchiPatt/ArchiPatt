import {useMutation, useQueryClient} from "@tanstack/react-query";
import {clientSettings} from "../../requests/clientSettings.ts";
import { notifications } from '@mantine/notifications'

const useDeleteHiddenAccount = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (accountId: string) => clientSettings.deleteHiddenAccount(accountId),
        onSuccess: () => {
            notifications.show({
                color: 'green',
                title: 'Успех',
                message: 'Счет открыт'
            })

            queryClient.invalidateQueries({ queryKey: ['hiddenAccounts'] })
        },
        onError: (_error) => {
            notifications.show({
                color: 'red',
                title: 'Ошибка',
                message: 'Не удалось открыть счет'
            })
        }
    })
}

export { useDeleteHiddenAccount }