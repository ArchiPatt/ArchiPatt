import {useMutation, useQueryClient} from "@tanstack/react-query";
import type {IssueCreditRequest} from "../../../types/credit/IssueCreditRequest.ts";
import {creditsApi} from "../../../api/repository/creditApi.ts";

const useCreateCredit = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (model: IssueCreditRequest) => creditsApi.createCredit(model),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['creditList'] })
        }
    })
}

export { useCreateCredit }