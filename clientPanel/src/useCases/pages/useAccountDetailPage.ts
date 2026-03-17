import {useNavigate, useParams} from "react-router-dom";
import {LINK_PATHS} from "../../shared/constants/LINK_PATHS.ts";
import {useState} from "react";
import type {DepositArgs} from "../../types/account/DepositArgs.ts";
import {useCloseAccount} from "../../api/hooks/accountHooks/useCloseAccount.ts";
import {useWithdrawAccount} from "../../api/hooks/accountHooks/useWithdrawAccount.ts";
import {useDepositAccount} from "../../api/hooks/accountHooks/useDepositAccount.ts";
import {useGetAccountById} from "../../api/hooks/accountHooks/useGetAccountById.ts";
import {useGetAccountTransactions} from "../../api/hooks/transactionHooks/useGetAccountTransactions.ts";

const useAccountDetailPage = () => {

    const { id } = useParams();
    const navigate = useNavigate()
    const [depositModalOpened, setDepositModalOpened] = useState(false);
    const [withdrawModalOpened, setWithdrawModalOpened] = useState(false);
    const [amount, setAmount] = useState<number | undefined>()
    const [withdrawAmount, setWithdrawAmount] = useState<number | undefined>()
    const [errorText, setErrorText] = useState<string | undefined>()

    const { mutate: close } = useCloseAccount()
    const { mutate: deposit } = useDepositAccount()
    const { mutate: withdraw } = useWithdrawAccount()

    const { data: account, isLoading: accountLoading, error: accountError } = useGetAccountById(id ?? "")
    const { data: transaction, isLoading: transactionLoading, error: transactionError } = useGetAccountTransactions({ id: account?.id ?? '' })

    const closeAccount = () => {
        close(id);
        navigate(LINK_PATHS.MAIN)
    }

    const onChangeAmount = (value: number | undefined) => {
        setAmount(value)
    }

    const onChangeWithdrawAmount = (value: number | undefined) => {
        setWithdrawAmount(value)
    }

    const depositAccount = () => {
        const model: DepositArgs = { model: { amount: amount ?? 0 }, id: id ?? "" }
        if (!amount) {
            setErrorText("Введите сумму")
            return
        }
        else if (amount <= 0) {
            setErrorText("Сумма должна быть больше 0")
            return
        }
        setErrorText(undefined)
        deposit(model)
        setDepositModalOpened(false)
        setAmount(undefined)
        navigate(LINK_PATHS.MAIN)
    }

    const withdrawAccount = () => {
        const model: DepositArgs = { model: { amount: withdrawAmount ?? 0 }, id: id ?? "" }
        if (!withdrawAmount) {
            setErrorText("Введите сумму")
            return
        }
        else if (withdrawAmount <= 0) {
            setErrorText("Сумма должна быть больше 0")
            return
        }
        else if (withdrawAmount > account?.balance) {
            setErrorText("Сумма не должна превышать баланс счета")
            return
        }
        setErrorText(undefined)
        withdraw(model)
        setWithdrawModalOpened(false)
        setWithdrawAmount(undefined)
        navigate(LINK_PATHS.MAIN)
    }

    return {
        account,
        accountLoading,
        accountError,
        transaction,
        transactionLoading,
        transactionError,
        closeAccount,
        depositModalOpened,
        setDepositModalOpened,
        withdrawModalOpened,
        setWithdrawModalOpened,
        amount,
        onChangeAmount,
        withdrawAmount,
        onChangeWithdrawAmount,
        depositAccount,
        withdrawAccount,
        errorText,
    }
}

export { useAccountDetailPage }