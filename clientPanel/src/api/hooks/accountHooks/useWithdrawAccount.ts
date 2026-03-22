import {useMutation, useQueryClient} from "@tanstack/react-query";
import {accountsApi} from "../../requests/accountsApi.ts";
import {notifications} from "@mantine/notifications";
import type {DepositArgs} from "../../../../generated/api/customTypes/account/DepositArgs.ts";

const useWithdrawAccount = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ model, id }: DepositArgs) => accountsApi.withdrawAccount(model, id),
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

export { useWithdrawAccount }