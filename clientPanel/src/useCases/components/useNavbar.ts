import type {CreateAccountRequest} from "../../types/account/CreateAccountRequest.ts";
import {userStorage} from "../../shared/storage/userStorage";
import {useCreateAccount} from "../../api/hooks/accountHooks/useCreateAccount.ts";
import {useLogout} from "../../api/hooks/authHooks/useLogout.ts";

const useNavbar = () => {

    const { mutate: newAccount } = useCreateAccount()
    const { mutate: logout } = useLogout()

    const createAccount = () => {
        const model: CreateAccountRequest = {
            clientId: userStorage.getItem()
        }
        newAccount(model)
    }

    return { createAccount, logout }
}

export { useNavbar }