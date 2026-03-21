import {useMutation, useQueryClient} from "@tanstack/react-query";
import {accountsApi} from "../../requests/accountsApi.ts";
import type {TransferRequest} from "../../../types/account/TransferRequest.ts";

const useTransferAccount = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (model: TransferRequest) => accountsApi.transferAccount(model),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['accountList'] })
            queryClient.invalidateQueries({ queryKey: ['account'] })
        }
    })
}

export { useTransferAccount }