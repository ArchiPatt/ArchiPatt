import {useMutation, useQueryClient} from "@tanstack/react-query";
import {creditsApi} from "../../requests/creditApi.ts";
import {notifications} from "@mantine/notifications";
import type {IssueCreditRequest} from "../../../../generated/api/credits";

const useCreateCredit = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (model: IssueCreditRequest) => creditsApi.createCredit(model),
        onSuccess: () => {
            notifications.show({
                color: 'green',
                title: 'Успех',
                message: 'Начислили'
            })

            queryClient.invalidateQueries({ queryKey: ['creditList'] })
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

export { useCreateCredit }