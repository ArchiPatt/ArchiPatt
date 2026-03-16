import type {AccountProps} from "../../ui/components/AccountCard/types/AccountProps.ts";
import {useNavigate} from "react-router-dom";
import {LINK_PATHS} from "../../shared/constants/LINK_PATHS.ts";

const useAccountCard = (props: AccountProps) => {

    const {
        id,
        balance,
        status,
    } = props

    const navigate = useNavigate()

    const openDetail = () => {
        navigate(LINK_PATHS.ACCOUNT_DETAIL.replace(':id', String(id)))
    }

    return {
        id,
        balance,
        status,
        openDetail
    }
}

export { useAccountCard }