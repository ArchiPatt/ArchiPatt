import {useMutation, useQueryClient} from "@tanstack/react-query";
import {accountsApi} from "../../requests/accountsApi.ts";
import {notifications} from "@mantine/notifications";
import type {CreateAccountRequest} from "../../../../generated/api/core";

const useCreateAccount = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (model: CreateAccountRequest) => accountsApi.createAccount(model),
        onSuccess: () => {
            notifications.show({
                color: 'green',
                title: 'Успех',
                message: 'Счет октрыт'
            })

            queryClient.invalidateQueries({ queryKey: ['accountList'] })
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

export { useCreateAccount }