import {useNavigate, useParams} from "react-router-dom";
import {useGetAccountById} from "../../../entities/Account";
import {useGetAccountTransactions} from "../../../entities/Transaction";
import {LINK_PATHS} from "../../../constants/LINK_PATHS.ts";

const useAccountDetailPage = () => {

    const { id } = useParams();
    const navigate = useNavigate();

    const { data: account } = useGetAccountById(id ?? "")

    const { data: transaction } = useGetAccountTransactions(account.id)


    const { mutate: closerAccount } = useMutation({
        mutationFn: () => accountsApi.closeAccount(id ?? ""),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['accountInfo', id] });
        },
    });

    const closeAccount = () => {
        closerAccount()
        navigate(LINK_PATHS.MAIN)
    }

    return { account, transaction, closeAccount }
}

export { useAccountDetailPage }