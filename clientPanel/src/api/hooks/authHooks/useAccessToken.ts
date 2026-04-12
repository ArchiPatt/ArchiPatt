import {useMutation, useQueryClient} from "@tanstack/react-query";
import {authApi} from "../../requests/authApi.ts";
import {tokenStorage} from "../../../shared/storage/tokenStorage";
import {refreshStorage} from "../../../shared/storage/refreshStorage";
import type {TokenResponse} from "../../../../generated/api/authHooks";
import Cookies from "js-cookie";

const useAccessToken = () => {
    const queryClient = useQueryClient();

    return useMutation<TokenResponse, Error, string>({
        mutationFn: (code: string) => authApi.accessToken(code),
        onSuccess: (data) => {
            tokenStorage.removeItem()
            refreshStorage.removeItem()
            Cookies.remove('token')
            tokenStorage.setItem(data.access_token)
            refreshStorage.setItem(data.refresh_token)
            Cookies.set('token', data.access_token)
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
