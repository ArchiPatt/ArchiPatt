import {useMutation, useQueryClient} from "@tanstack/react-query";
import {accountsApi} from "../../requests/accountsApi.ts";

const useCloseAccount = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => accountsApi.closeAccount(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['accountList'] })
            queryClient.invalidateQueries({ queryKey: ['account'] })
        }
    })
}

export { useCloseAccount }