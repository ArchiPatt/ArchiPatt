import {useMutation, useQueryClient} from "@tanstack/react-query";
import {authApi} from "../../requests/authApi.ts";
import {tokenStorage} from "../../../shared/storage/tokenStorage";
import {userStorage} from "../../../shared/storage/userStorage";
import {refreshStorage} from "../../../shared/storage/refreshStorage";
import Cookies from 'js-cookie'

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
            window.location.replace('http://localhost:4000/login?return_to=http%3A%2F%2Flocalhost%3A5173%2F')
        }
    })
}

export { useLogout }