import {useNavigate, useParams} from "react-router-dom";
import {useCreditRepay, useGetCreditById} from "../../../entities/Credit";
import {useGetCreditTransactions} from "../../../entities/Transaction";
import {useGetTariffById} from "../../../entities/Tariff";
import {useGetAccountById} from "../../../entities/Account";
import {remainsPercantage} from "../../../utils/remainsPercantage.ts";
import {useState} from "react";
import {LINK_PATHS} from "../../../constants/LINK_PATHS.ts";
import type {RepayArgs} from "../../../entities/Credit/types/RepayArgs.ts";

const useCreditDetailPage = () => {

    const { id } = useParams()
    const navigate = useNavigate()
    const [modalState, setModalState] = useState(false)
    const [repayAmount, setRepayAmount] = useState<number | undefined>()
    const [errorText, setErrorText] = useState<string | undefined>()

    const { mutate: repay } = useCreditRepay()

    const { data: credit, isLoading: creditLoading, error: creditError } = useGetCreditById(id ?? '')
    const { data: transaction, isLoading: transactionLoading, error: transactionError } = useGetCreditTransactions(credit?.id)
    const { data: tariff, isLoading: tariffLoading, error: tariffError } = useGetTariffById(credit?.tariffId)
    const { data: account, isLoading: accountLoading, error: accountError } = useGetAccountById(credit?.accountId)

    const percantage = remainsPercantage(Number(credit?.principalAmount), Number(credit?.outstandingAmount))

    const onChangeRepayAmount = (value: number | undefined) => {
        setRepayAmount(value)
    }

    const selectFullRepayAmount = () => {
        setRepayAmount(Number(credit?.outstandingAmount))
    }

    const repayCredit = () => {
        const model: RepayArgs = { model: { amount: repayAmount ?? 0 }, id: id ?? "" }
        if (!repayAmount) {
            setErrorText("Сумма должна быть больше 0")
            return
        }
        else if (repayAmount <= 0) {
            setErrorText("Введите сумму")
            return
        }
        else if (repayAmount > account?.balance) {
            setErrorText("Недостаточно средств на счете")
            return
        }
        else if (repayAmount > credit?.outstandingAmount) {
            setErrorText("Сумма погашения не может превышать сумму долга")
            return
        }
        setErrorText(undefined)
        repay(model)
        setModalState(false)
        setRepayAmount(undefined)
        navigate(LINK_PATHS.MAIN)
    }

    return {
        credit,
        creditLoading,
        creditError,
        transaction,
        transactionLoading,
        transactionError,
        tariff,
        tariffLoading,
        tariffError,
        account,
        accountLoading,
        accountError,
        percantage,
        modalState,
        setModalState,
        repayAmount,
        onChangeRepayAmount,
        errorText,
        repayCredit,
        selectFullRepayAmount
    }
}

export { useCreditDetailPage }