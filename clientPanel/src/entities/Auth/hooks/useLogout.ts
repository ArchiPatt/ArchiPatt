import {useMutation, useQueryClient} from "@tanstack/react-query";
import {authApi} from "../api/authApi.ts";
import {tokenStorage} from "../../../app/storage/tokenStorage";
import {userStorage} from "../../../app/storage/userStorage";
import {refreshStorage} from "../../../app/storage/refreshStorage";

const useLogout = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: () => authApi.logout(),
        onSuccess: () => {
            tokenStorage.removeItem()
            refreshStorage.removeItem()
            userStorage.removeItem()
            queryClient.invalidateQueries({ queryKey: ['user'] })
            window.location.href = 'http://localhost:4004/login?return_to=' + encodeURIComponent('http://localhost:5173/')
        }
    })
}

export { useLogout }