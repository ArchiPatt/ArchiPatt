import {useMutation, useQueryClient} from "@tanstack/react-query";
import {authApi} from "../../requests/authApi.ts";
import {tokenStorage} from "../../../shared/storage/tokenStorage";
import {refreshStorage} from "../../../shared/storage/refreshStorage";
import type {TokenResponse} from "../../../../generated/api/authHooks";

const useRefreshToken = () => {
    const queryClient = useQueryClient();

    return useMutation<TokenResponse, Error, string>({
        mutationFn: (refreshToken: string) => authApi.refreshToken(refreshToken),
        onSuccess: (data) => {
            tokenStorage.removeItem()
            refreshStorage.removeItem()

            tokenStorage.setItem(data.access_token)
            refreshStorage.setItem(data.refresh_token)

            queryClient.invalidateQueries({ queryKey: ['user'] });
        },
        onError: (error) => {
            console.error("Не удалось обновить токен", error);
        }
    });
}

export { useRefreshToken }