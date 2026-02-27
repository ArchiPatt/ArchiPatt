import type {AccountProps} from "../types/AccountProps.ts";
import type {accountStatus} from "../../../types/accountStatus.ts";
import {useNavigate} from "react-router-dom";
import {LINK_PATHS} from "../../../constants/LINK_PATHS.ts";

const useAccountCard = (props: AccountProps) => {

    const {
        id,
        clientId,
        balance,
        status,
    } = props

    const navigate = useNavigate()

    const openDetail = () => {
        navigate(LINK_PATHS.ACCOUNT_DETAIL.replace(':id', String(id)))
    }

    return {
        id,
        clientId,
        balance,
        status,
        openDetail
    }
}

export { useAccountCard }