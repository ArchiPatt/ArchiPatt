import {useEffect, useState} from "react";
import type {account} from "../../../types/account.ts";
import {useMutation, useQuery} from "@tanstack/react-query";
import {tokenStorage} from "../../../app/storage/tokenStorage";
import {accountsApi} from "../../../api";
import {useNavigate, useParams} from "react-router-dom";
import type {accountTransaction} from "../../../types/accountTransaction.ts";
import {LINK_PATHS} from "../../../constants/LINK_PATHS.ts";

const useAccountDetailPage = () => {

    const { id } = useParams();
    const navigate = useNavigate();


    const [accountInfo, setAccountInfo] = useState<account>({id: '', clientId: '', status: 'open', balance: '', createdAt: '' })
    const [transactions, setTransactions] = useState<accountTransaction>({ items: [], total: 0 })

    const { data: account } = useQuery({
        queryKey: ['accountInfo'],
        queryFn: () => accountsApi.getAccountById(id ?? ""),
        enabled: !!tokenStorage.getItem(),
        retry: false,
    });

    const { data: transaction } = useQuery({
        queryKey: ['transaction'],
        queryFn: () => accountsApi.getAccountTransactions(accountInfo.id),
        enabled: !!accountInfo.id,
        retry: false,
    });

    useEffect(() => {
        if (account) {
            setAccountInfo(account)
        }
    }, [account]);

    useEffect(() => {
        if (transaction) {
            setTransactions(transaction)
        }
    }, [transaction])

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

    return { accountInfo, transactions, closeAccount }
}

export { useAccountDetailPage }