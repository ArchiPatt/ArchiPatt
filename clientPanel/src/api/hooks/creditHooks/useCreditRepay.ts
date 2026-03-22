import {useMutation, useQueryClient} from "@tanstack/react-query";
import {creditsApi} from "../../requests/creditApi.ts";
import {notifications} from "@mantine/notifications";
import type {RepayArgs} from "../../../types/credit/RepayArgs.ts";

const useCreditRepay = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ model, id }: RepayArgs) => creditsApi.creditRepay(model, id),
        onSuccess: () => {
            notifications.show({
                color: 'green',
                title: 'Успех',
                message: 'Начислили'
            })

            queryClient.invalidateQueries({ queryKey: ['creditList'] })
            queryClient.invalidateQueries({ queryKey: ['credit'] })
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

export { useCreditRepay }