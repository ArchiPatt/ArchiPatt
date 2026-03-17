import {useMutation, useQueryClient} from "@tanstack/react-query";
import {accountsApi} from "../../requests/accountsApi.ts";
import type {DepositArgs} from "../../../types/account/DepositArgs.ts";

const useWithdrawAccount = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ model, id }: DepositArgs) => accountsApi.withdrawAccount(model, id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['accountList'] })
            queryClient.invalidateQueries({ queryKey: ['account'] })
        }
    })
}

export { useWithdrawAccount }