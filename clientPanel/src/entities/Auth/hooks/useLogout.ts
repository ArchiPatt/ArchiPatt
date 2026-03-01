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
            window.location.href = 'http://localhost:4000/login?return_to=http%3A%2F%2Flocalhost%3A5173%2F'
        }
    })
}

export { useLogout }