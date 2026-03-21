import {useMutation, useQueryClient} from "@tanstack/react-query";
import {clientSettings} from "../../requests/clientSettings.ts";

const useDeleteHiddenAccount = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (accountId: string) => clientSettings.deleteHiddenAccount(accountId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['hiddenAccounts'] })
        }
    })
}

export { useDeleteHiddenAccount }