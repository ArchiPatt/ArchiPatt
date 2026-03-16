import {useCreateAccount} from "../../request/account";
import type {CreateAccountRequest} from "../../types/account/CreateAccountRequest.ts";
import {userStorage} from "../../shared/storage/userStorage";
import {useLogout} from "../../request/auth";

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