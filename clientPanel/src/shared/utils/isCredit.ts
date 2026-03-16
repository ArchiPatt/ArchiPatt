import type {CreditPaymentResponse} from "../../types/transaction/CreditPaymentResponse.ts";
import type {AccountOperation} from "../../types/transaction/AccountOperation.ts";

const isAccountOperation = (
    item: AccountOperation | CreditPaymentResponse
): item is CreditPaymentResponse => {
    return 'PaymentType' in item
}

export { isAccountOperation }