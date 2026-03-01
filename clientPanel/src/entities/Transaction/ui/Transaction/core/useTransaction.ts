import type {AccountOperationsPage} from "../../../types/AccountOperationsPage.ts";
import type {CreditPaymentResponse} from "../../../types/CreditPaymentResponse.ts";


const useTransaction = (props: AccountOperationsPage | CreditPaymentResponse) => {

    const {
        items,
        total
    } = props

    let slicedArray = items

    if (total !== 0) {
        slicedArray = items.slice(0, total + 1)
    }

    return {
        slicedArray,
    }
}

export { useTransaction }