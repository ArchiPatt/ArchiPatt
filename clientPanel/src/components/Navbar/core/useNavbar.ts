import {useCreateAccount} from "../../../entities/Account";
import type {CreateAccountRequest} from "../../../entities/Account/types/CreateAccountRequest.ts";
import {userStorage} from "../../../app/storage/userStorage";
import {useLogout} from "../../../entities/Auth";

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