import {useParams} from "react-router-dom";
import {useState} from "react";
import {useCloseAccount} from "../../api/hooks/accountHooks/useCloseAccount.ts";
import {useWithdrawAccount} from "../../api/hooks/accountHooks/useWithdrawAccount.ts";
import {useDepositAccount} from "../../api/hooks/accountHooks/useDepositAccount.ts";
import {useGetAccountById} from "../../api/hooks/accountHooks/useGetAccountById.ts";
import {useGetAccountList} from "../../api/hooks/accountHooks/useGetAccountList.ts";
import {useCombobox} from "@mantine/core";
import {useTransferAccount} from "../../api/hooks/accountHooks/useTransferAccount.ts";
import {useAccountOperationsWS} from "../../api/hooks/accountHooks/useAccountOperationsWS.ts";
import {useSetHiddenAccount} from "../../api/hooks/settingsHooks/useSetHiddenAccount.ts";
import {useDeleteHiddenAccount} from "../../api/hooks/settingsHooks/useDeleteHiddenAccount.ts";
import {useGetHiddenAccounts} from "../../api/hooks/settingsHooks/useGetHiddenAccount.ts";
import type {DepositArgs} from "../../../generated/api/customTypes/account/DepositArgs.ts";
import type {TransferRequest} from "../../../generated/api/core";

const useAccountDetailPage = () => {

    const { id } = useParams();
    const combobox = useCombobox({
        onDropdownClose: () => combobox.resetSelectedOption(),
    });

    const [depositModalOpened, setDepositModalOpened] = useState(false);
    const [amount, setAmount] = useState<number | undefined>()

    const [withdrawModalOpened, setWithdrawModalOpened] = useState(false);
    const [withdrawAmount, setWithdrawAmount] = useState<number | undefined>()

    const [transferModalOpened, setTransferModalOpened] = useState(false);
    const [transferAmount, setTransferAmount] = useState<number | undefined>()
    const [transferdAccount, setTransferdAccount] = useState<string | null>()

    const [errorText, setErrorText] = useState<string | undefined>()

    const { mutate: close } = useCloseAccount()
    const { mutate: deposit } = useDepositAccount()
    const { mutate: withdraw } = useWithdrawAccount()
    const { mutate: transferAccount } = useTransferAccount()
    const { mutate: hiddenAccount } = useSetHiddenAccount()
    const { mutate: showAccount } = useDeleteHiddenAccount()


    const { data: account, isLoading: accountLoading, error: accountError } = useGetAccountById(id ?? "")
    const { data: accountList, isLoading: accountListLoading, error: accountListError } = useGetAccountList()
    const { data: hiddenAccounts } = useGetHiddenAccounts()
    const { operations, operationsLoading } = useAccountOperationsWS(account?.id ?? '')

    const isHidden = hiddenAccounts?.hiddenAccounts.includes(id ?? '')

    const closeAccount = () => {
        close(id);
    }

    const onChangeAmount = (value: number | undefined) => {
        setAmount(value)
    }

    const onChangeWithdrawAmount = (value: number | undefined) => {
        setWithdrawAmount(value)
    }

    const onChangeTransferAmount = (value: number | undefined) => {
        setTransferAmount(value)
    }

    const onChangeTrasferdAccount = (accountId: string | null) => {
        setTransferdAccount(accountId)
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
    }

    const transfer = () => {
        const model: TransferRequest = {
            fromAccountId: account?.id ?? '',
            toAccountId: transferdAccount ?? '',
            amount: transferAmount ?? 0,
        }

        if (!transferdAccount || !transferAmount) {
            setErrorText("Все поля должны быть заполнены")
            return
        }
        else if (transferAmount < 0) {
            setErrorText("Сумма должна быть больше 0")
            return
        }
        else if (transferAmount > account?.balance) {
            setErrorText("Сумма не должна превышать баланс счета")
            return
        }
        setErrorText(undefined)
        transferAccount(model)
        setTransferModalOpened(false)
        setTransferdAccount(null)
        setTransferAmount(null)
    }

    const setHiddenAccount = () => {
        if (isHidden) {
            showAccount(id)
            return
        }
        hiddenAccount(id)
    }

    return {
        account,
        accountLoading,
        accountError,
        operations,
        operationsLoading,
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
        transferModalOpened,
        setTransferModalOpened,
        transferAmount,
        transferdAccount,
        accountList,
        accountListLoading,
        accountListError,
        onChangeTransferAmount,
        onChangeTrasferdAccount,
        combobox,
        transfer,
        isHidden,
        hiddenAccounts,
        setHiddenAccount
    }
}

export { useAccountDetailPage }