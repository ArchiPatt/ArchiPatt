import {useLogout} from "../../../api/hooks/authHooks/useLogout.ts";
import {useColorScheme} from "./useColorScheme.ts";

const useNavbar = () => {

    const { mutate: logout } = useLogout()
    const { setColorScheme, colorScheme } = useColorScheme()

    return { logout, setColorScheme, colorScheme }
}

export { useNavbar }