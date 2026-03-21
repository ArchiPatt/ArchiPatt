import {useGetCurrencies} from "../../api/hooks/accountHooks/useGetCurrencies.ts";
import {useState} from "react";
import type {CreateAccountRequest} from "../../types/account/CreateAccountRequest.ts";
import {userStorage} from "../../shared/storage/userStorage";
import {useCreateAccount} from "../../api/hooks/accountHooks/useCreateAccount.ts";
import type {Currency} from "../../types/account/Currency.ts";
import {useNavigate} from "react-router-dom";
import {LINK_PATHS} from "../../shared/constants/LINK_PATHS.ts";

const useOpenAccountPage = () => {

    const [currency, setCurrency] = useState<Currency>('RUB');
    const navigate = useNavigate();

    const { data: currencyList, isLoading: currenciesLoading, error: currenciesError } = useGetCurrencies()

    const { mutate: newAccount } = useCreateAccount()

    const createAccount = () => {
        const model: CreateAccountRequest = {
            clientId: userStorage.getItem(),
            currency: currency
        }
        newAccount(model)
        //Пока перекидываем на главную станицу
        navigate(LINK_PATHS.MAIN)
    }

    return {
        currencyList,
        currency,
        setCurrency,
        createAccount
    }
}

export { useOpenAccountPage }