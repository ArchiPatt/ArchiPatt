import type {TransactionProps} from "../../types/transaction/TransactionProps.ts";

const useTransaction = (props: TransactionProps) => {

    const {
        items
    } = props

    return {
        items
    }
}

export { useTransaction }