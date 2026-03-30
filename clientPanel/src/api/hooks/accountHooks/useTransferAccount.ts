import {useMutation, useQueryClient} from "@tanstack/react-query";
import {accountsApi} from "../../requests/accountsApi.ts";
import {notifications} from "@mantine/notifications";
import type {TransferRequest} from "../../../../generated/api/core";

const useTransferAccount = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (model: TransferRequest) => accountsApi.transferAccount(model),
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

export { useTransferAccount }