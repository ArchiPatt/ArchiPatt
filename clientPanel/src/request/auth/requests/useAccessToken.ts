import {useMutation, useQueryClient} from "@tanstack/react-query";
import {authApi} from "../../../api/repository/authApi.ts";
import {tokenStorage} from "../../../shared/storage/tokenStorage";
import {refreshStorage} from "../../../shared/storage/refreshStorage";
import type {TokenResponse} from "../../../types/auth/TokenResponse.ts";

const useAccessToken = () => {
    const queryClient = useQueryClient();

    return useMutation<TokenResponse, Error, string>({
        mutationFn: (code: string) => authApi.accessToken(code),
        onSuccess: (data) => {
            tokenStorage.removeItem()
            refreshStorage.removeItem()

            tokenStorage.setItem(data.access_token)
            refreshStorage.setItem(data.refresh_token)

            queryClient.invalidateQueries({ queryKey: ['user'] });
        },
        onError: (error) => {
            console.error("Не удалось получить access token", error);
        }
    });
}

export { useAccessToken }