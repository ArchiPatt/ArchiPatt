import type {CreditPaymentResponse} from "../types/CreditPaymentResponse.ts";
import type {AccountOperation} from "../types/AccountOperation.ts";

const isAccountOperation = (
    item: AccountOperation | CreditPaymentResponse
): item is CreditPaymentResponse => {
    return 'PaymentType' in item
}

export { isAccountOperation }