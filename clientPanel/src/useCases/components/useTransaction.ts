import type {TransactionProps} from "../../../generated/api/customTypes/transaction/TransactionProps.ts";

const useTransaction = (props: TransactionProps) => {

    const {
        items
    } = props

    return {
        items
    }
}

export { useTransaction }