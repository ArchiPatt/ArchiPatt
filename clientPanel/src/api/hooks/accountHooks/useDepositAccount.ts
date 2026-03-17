import {accountsApi} from "../../requests/accountsApi.ts";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import type {DepositArgs} from "../../../types/account/DepositArgs.ts";

const useDepositAccount = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ model, id }: DepositArgs) => accountsApi.depositAccount(model, id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['accountList'] })
            queryClient.invalidateQueries({ queryKey: ['account'] })
        }
    })
}

export { useDepositAccount }