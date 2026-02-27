import type {AccountOperationsPage} from "../../../types/AccountOperationsPage.ts";


const useTransaction = (props: AccountOperationsPage) => {

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