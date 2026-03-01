import {useMutation, useQueryClient} from "@tanstack/react-query";
import type {TokenResponse} from "../../../types/TokenResponse.ts";
import {authApi} from "../api/authApi.ts";
import {tokenStorage} from "../../../app/storage/tokenStorage";
import {refreshStorage} from "../../../app/storage/refreshStorage";

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