import {useMutation, useQueryClient} from "@tanstack/react-query";
import {authApi} from "../../requests/authApi.ts";
import {tokenStorage} from "../../../shared/storage/tokenStorage";
import {userStorage} from "../../../shared/storage/userStorage";
import {refreshStorage} from "../../../shared/storage/refreshStorage";
import Cookies from 'js-cookie'
import {AUTH_LINK} from "../../../shared/constants/AUTH_LINK.ts";

const useLogout = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: () => authApi.logout(),
        onSuccess: () => {
            tokenStorage.removeItem()
            refreshStorage.removeItem()
            userStorage.removeItem()
            queryClient.invalidateQueries({ queryKey: ['user'] })
            Cookies.remove('auth_session')
            window.location.replace(AUTH_LINK)
        }
    })
}

export { useLogout }
