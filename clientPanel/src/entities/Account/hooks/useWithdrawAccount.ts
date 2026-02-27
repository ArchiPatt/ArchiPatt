import {useMutation, useQueryClient} from "@tanstack/react-query";
import {accountsApi} from "../api/accountsApi.ts";
import type {DepositArgs} from "../types/DepositArgs.ts";

const useWithdrawAccount = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ model, id }: DepositArgs) => accountsApi.withdrawAccount(model, id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['accountList', 'account'] })
        }
    })
}

export { useWithdrawAccount }