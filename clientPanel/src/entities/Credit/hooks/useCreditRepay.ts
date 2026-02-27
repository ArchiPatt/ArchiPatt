import {useMutation, useQueryClient} from "@tanstack/react-query";
import {creditsApi} from "../api/creditApi.ts";
import type {RepayArgs} from "../types/RepayArgs.ts";

const useCreditRepay = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ model, id }: RepayArgs) => creditsApi.creditRepay(model, id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['creditList', 'credit'] })
        }
    })
}

export { useCreditRepay }