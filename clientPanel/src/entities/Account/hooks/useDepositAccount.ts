import {accountsApi} from "../api/accountsApi.ts";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import type {DepositArgs} from "../types/DepositArgs.ts";

const useDepositAccount = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ model, id }: DepositArgs) => accountsApi.depositAccount(model, id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['accountList', 'account'] })
        }
    })
}

export { useDepositAccount }