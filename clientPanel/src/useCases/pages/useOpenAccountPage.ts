import {useGetCurrencies} from "../../api/hooks/accountHooks/useGetCurrencies.ts";

const useOpenAccountPage = () => {

    const { data: currencies, isLoading: currenciesLoading, error: currenciesError } = useGetCurrencies()


    return {
        currencies
    }
}

export { useOpenAccountPage }