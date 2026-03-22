import {useMemo, useState} from "react";
import type {TariffResponse} from "../../types/tariff/TariffResponse.ts";
import type {IssueCreditRequest} from "../../types/credit/IssueCreditRequest.ts";
import {userStorage} from "../../shared/storage/userStorage";
import {useNavigate} from "react-router-dom";
import {LINK_PATHS} from "../../shared/constants/LINK_PATHS.ts";
import type {Account} from "../../types/account/Account.ts";
import {useCreateCredit} from "../../api/hooks/creditHooks/useCreateCredit.ts";
import {useGetAccountList} from "../../api/hooks/accountHooks/useGetAccountList.ts";
import {useGetTariffList} from "../../api/hooks/tariffHooks/useGetTariffList.ts";
import {useGetCurrencies} from "../../api/hooks/accountHooks/useGetCurrencies.ts";
import {useGetMasterAccount} from "../../api/hooks/accountHooks/useGetMasterAccount.ts";

const useOpenCreditPage = () => {

    const navigate = useNavigate();
    const [choosenTariff, setChoosenTariff] = useState<string | undefined>();
    const [choosenAccount, setChoosenAccount] = useState<string | undefined>();
    const [amount, setAmount] = useState<number | undefined>();
    const [errorText, setErrorText] = useState<string | undefined>()

    const { mutate: createCredit } = useCreateCredit()

    const { data: account, isLoading: accountLoading, error: accountError } = useGetAccountList()
    const { data: tariff, isLoading: tariffLoading, error: tariffError } = useGetTariffList()
    const { data: masterAccount } = useGetMasterAccount()

    const filteredTariff: TariffResponse[] = useMemo(() => {
        if (!tariff) return []
        return tariff.filter((item) => item.isActive)
    }, [tariff])

    const filteredAccount: Account[] = useMemo(() => {
        if (!account) return []
        return account.filter((item) => item.status === 'open')
    }, [account])

    const handleChooseTariff = (value: string) => {
        setChoosenTariff(value)
    }

    const handleChooseAccount = (value: string) => {
        setChoosenAccount(value)
    }

    const onChangeAmount = (value: number | undefined) => {
        setAmount(value)
    }

    const takeCredit = () => {
        const model: IssueCreditRequest = {
            clientId: userStorage.getItem() as string,
            accountId: choosenAccount ?? '',
            tariffId: choosenTariff ?? '',
            amount: amount ?? 0
        }

        if (model.accountId === '' || !model.accountId) {
            setErrorText("Выберите счет")
            return
        }
        else if (model.tariffId === '' || !model.tariffId) {
            setErrorText("Выберите тариф")
            return
        }
        else if (model.amount < 1000) {
            setErrorText("Минимальная сумма кредита 1000")
            return
        }
        else if (model.amount > masterAccount?.balance) {
            setErrorText("Банк не может выдать данную сумму в кредит")
            return
        }
        setErrorText(undefined)
        createCredit(model)
        navigate(LINK_PATHS.MAIN)
    }

    return {
        filteredAccount,
        accountLoading,
        accountError,
        filteredTariff,
        tariffLoading,
        tariffError,
        choosenTariff,
        choosenAccount,
        amount,
        handleChooseTariff,
        handleChooseAccount,
        onChangeAmount,
        takeCredit,
        errorText,
    }
}

export { useOpenCreditPage }