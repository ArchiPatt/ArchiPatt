import type {CreditStatus} from "../../../../generated/api/customTypes/credit/CreditStatus.ts";

const getCreditStatusLabel = (status: CreditStatus) => {
    if (status === 'active') return 'Активен'
    if (status === 'closed') return 'Закрыт'
    if (status === 'defaulted') return 'Просрочен'

    return 'Неизвестен'
}

export { getCreditStatusLabel }