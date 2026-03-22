import {accountsApi} from "../../requests/accountsApi.ts";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {notifications} from "@mantine/notifications";
import type {DepositArgs} from "../../../types/account/DepositArgs.ts";

const useDepositAccount = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ model, id }: DepositArgs) => accountsApi.depositAccount(model, id),
        onSuccess: () => {
            notifications.show({
                color: 'green',
                title: 'Успех',
                message: 'Начислили'
            })

            queryClient.invalidateQueries({ queryKey: ['accountList'] })
            queryClient.invalidateQueries({ queryKey: ['account'] })
        },
        onError: (_error) => {
            notifications.show({
                color: 'red',
                title: 'Ошибка',
                message: 'Не удалось начислить деньги на счет'
            })
        }
    })
}

export { useDepositAccount }