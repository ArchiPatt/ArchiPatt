import type {TransactionType} from "../../types/transaction/TransactionType.ts";
import {isAccountOperation} from "../../shared/utils/isCredit.ts";
import type {AccountOperation} from "../../types/transaction/AccountOperation.ts";

const useTransaction = (props: AccountOperation[]) => {

    // const normalizedType: TransactionType[] = slicedArray.map((item) => {
    //     if (isAccountOperation(item)) {
    //         return {
    //             id: item.id,
    //             amount: item.amount,
    //             type: item.paymentType as TransactionType['type'],
    //             createdAt: item.createdAt,
    //         }
    //     }
    //
    //     return {
    //         id: item.id,
    //         amount: item.amount,
    //         type: item.type,
    //         createdAt: item.createdAt,
    //     }
    // })



    return {
        props
    }
}

export { useTransaction }