import {useNavigate, useParams} from "react-router-dom";
import {useCloseAccount, useDepositAccount, useGetAccountById, useWithdrawAccount} from "../../../entities/Account";
import {useGetAccountTransactions} from "../../../entities/Transaction";
import {LINK_PATHS} from "../../../constants/LINK_PATHS.ts";
import {useState} from "react";
import type {DepositArgs} from "../../../entities/Account/types/DepositArgs.ts";

const useAccountDetailPage = () => {

    const { id } = useParams();
    const navigate = useNavigate()
    const [depositModalOpened, setDepositModalOpened] = useState(false);
    const [withdrawModalOpened, setWithdrawModalOpened] = useState(false);
    const [amount, setAmount] = useState<number | undefined>(undefined)
    const [withdrawAmount, setWithdrawAmount] = useState<number | undefined>(undefined)
    const [errorText, setErrorText] = useState<string | undefined>(undefined)

    const { mutate: close } = useCloseAccount()
    const { mutate: deposit } = useDepositAccount()
    const { mutate: withdraw } = useWithdrawAccount()

    const { data: account, isLoading: accountLoading, error: accountError } = useGetAccountById(id ?? "")
    const { data: transaction, isLoading: transactionLoading, error: transactionError } = useGetAccountTransactions({ id: account?.id })

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
            setErrorText("Сумма должна быть больше 0")
            return
        }
        else if (amount <= 0) {
            setErrorText("Введите сумму")
            return
        }
        setErrorText(undefined)
        deposit(model)
        setDepositModalOpened(false)
        setAmount(0)
        navigate(LINK_PATHS.MAIN)
    }

    const withdrawAccount = () => {
        const model: DepositArgs = { model: { amount: withdrawAmount ?? 0 }, id: id ?? "" }
        if (!withdrawAmount) {
            setErrorText("Сумма должна быть больше 0")
            return
        }
        else if (withdrawAmount <= 0) {
            setErrorText("Введите сумму")
            return
        }
        else if (withdrawAmount > account?.balance) {
            setErrorText("Сумма не должна превышать баланс счета")
            return
        }
        setErrorText(undefined)
        withdraw(model)
        setWithdrawModalOpened(false)
        setWithdrawAmount(0)
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