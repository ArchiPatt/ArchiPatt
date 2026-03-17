import {useMutation, useQueryClient} from "@tanstack/react-query";
import {authApi} from "../api/authApi.ts";
import {tokenStorage} from "../../../app/storage/tokenStorage";
import {refreshStorage} from "../../../app/storage/refreshStorage";
import type {TokenResponse} from "../types/TokenResponse.ts";

const useAccessToken = () => {
    const queryClient = useQueryClient();

    return useMutation<TokenResponse, Error, string>({
        mutationFn: (code: string) => authApi.accessToken(code),
        onSuccess: (data) => {
            tokenStorage.removeItem()
            refreshStorage.removeItem()

            tokenStorage.setItem(data.access_token)
            refreshStorage.setItem(data.refresh_token)

            // Убираем code из URL после успешного обмена
            const url = new URL(window.location.href);
            url.searchParams.delete('code');
            window.history.replaceState({}, '', url.toString());

            queryClient.invalidateQueries({ queryKey: ['user'] });
        },
        onError: (error) => {
            console.error("Не удалось получить access token", error);
        }
    });
}

export { useAccessToken }