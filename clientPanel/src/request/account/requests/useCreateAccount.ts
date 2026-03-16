import type {CreateAccountRequest} from "../../../types/account/CreateAccountRequest.ts";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {accountsApi} from "../../../api/repository/accountsApi.ts";

const useCreateAccount = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (model: CreateAccountRequest) => accountsApi.createAccount(model),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['accountList'] })
        }
    })
}

export { useCreateAccount }