import type {TransactionType} from "../../types/transaction/TransactionType.ts";
import {isAccountOperation} from "../../shared/utils/isCredit.ts";
import type {AccountOperation} from "../../types/transaction/AccountOperation.ts";
import type {TransactionProps} from "../../types/transaction/TransactionProps.ts";

const useTransaction = (props: TransactionProps) => {

    const {
        items
    } = props



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
        items
    }
}

export { useTransaction }