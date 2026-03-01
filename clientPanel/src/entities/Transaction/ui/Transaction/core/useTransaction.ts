import type {AccountOperationsPage} from "../../../types/AccountOperationsPage.ts";
import type {CreditPaymentResponse} from "../../../types/CreditPaymentResponse.ts";
import type {TransactionType} from "../../../types/TransactionType.ts";
import {isAccountOperation} from "../../../utils/isCredit.ts";

const useTransaction = (props: AccountOperationsPage | { items: CreditPaymentResponse[], total: number }) => {

    const {
        items,
        total
    } = props

    let slicedArray = items

    if (total && total !== 0) {
        slicedArray = items.slice(0, total + 1)
    }

    const normalizedType: TransactionType[] = slicedArray.map((item) => {
        if (isAccountOperation(item)) {
            return {
                id: item.id,
                amount: item.amount,
                type: item.paymentType as TransactionType['type'],
                createdAt: item.createdAt,
            }
        }

        return {
            id: item.id,
            amount: item.amount,
            type: item.type,
            createdAt: item.createdAt,
        }
    })



    return {
        slicedArray: normalizedType,
    }
}

export { useTransaction }