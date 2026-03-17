import {useMutation, useQueryClient} from "@tanstack/react-query";
import {creditsApi} from "../../requests/creditApi.ts";
import type {RepayArgs} from "../../../types/credit/RepayArgs.ts";

const useCreditRepay = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ model, id }: RepayArgs) => creditsApi.creditRepay(model, id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['creditList'] })
            queryClient.invalidateQueries({ queryKey: ['credit'] })
        }
    })
}

export { useCreditRepay }