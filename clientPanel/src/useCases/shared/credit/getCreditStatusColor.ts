import type {CreditStatus} from "../../../../generated/api/customTypes/credit/CreditStatus.ts";

const getCreditStatusColor = (status: CreditStatus) => {
    if (status === 'active') return 'green'
    if (status === 'closed') return 'gray'
    if (status === 'defaulted') return 'red'

    return 'gray'
}

export { getCreditStatusColor }