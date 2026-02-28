import {useNavigate, useParams} from "react-router-dom";
import {useGetAccountById} from "../../../entities/Account";
import {useGetAccountTransactions} from "../../../entities/Transaction";

const useAccountDetailPage = () => {

    const { id } = useParams();

    const { data: account, isLoading: accountLoading, error: accountError } = useGetAccountById(id ?? "")

    const { data: transaction, isLoading: transactionLoading, error: transactionError } = useGetAccountTransactions({ id: account?.id })

    return {
        account,
        accountLoading,
        accountError,
        transaction,
        transactionLoading,
        transactionError
    }
}

export { useAccountDetailPage }