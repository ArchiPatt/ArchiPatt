import {useMutation, useQueryClient} from "@tanstack/react-query";
import {accountsApi} from "../../requests/accountsApi.ts";
import {notifications} from "@mantine/notifications";

const useCloseAccount = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => accountsApi.closeAccount(id),
        onSuccess: () => {
            notifications.show({
                color: 'green',
                title: 'Успех',
                message: 'Счет закрыт'
            })

            queryClient.invalidateQueries({ queryKey: ['accountList'] })
            queryClient.invalidateQueries({ queryKey: ['account'] })
        },
        onError: (_error) => {
            notifications.show({
                color: 'red',
                title: 'Ошибка',
                message: 'Не удалось закрыть счет'
            })
        }
    })
}

export { useCloseAccount }