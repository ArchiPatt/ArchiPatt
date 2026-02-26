import type {AccountProps} from "../types/AccountProps.ts";
import type {accountStatus} from "../../../types/accountStatus.ts";

const useAccountCard = (props: AccountProps) => {

    const {
        id,
        clientId,
        balance,
        status,
    } = props

    return {
        id,
        clientId,
        balance,
        status,
    }
}

export { useAccountCard }