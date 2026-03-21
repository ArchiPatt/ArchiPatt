import {useMutation, useQueryClient} from "@tanstack/react-query";
import {clientSettings} from "../../requests/clientSettings.ts";

const useSetHiddenAccount = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (accountId: string) => clientSettings.setHiddenAccount({ accountId: accountId }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['hiddenAccounts'] })
        }
    })
}

export { useSetHiddenAccount }