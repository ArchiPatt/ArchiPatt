import {useCreateAccount} from "../../../entities/Account";
import type {CreateAccountRequest} from "../../../entities/Account/types/CreateAccountRequest.ts";
import {userStorage} from "../../../app/storage/userStorage";

const useNavbar = () => {

    const { mutate: newAccount } = useCreateAccount()

    const createAccount = () => {
        const model: CreateAccountRequest = {
            clientId: userStorage.getItem()
        }
        newAccount(model)
    }

    return { createAccount }
}

export { useNavbar }