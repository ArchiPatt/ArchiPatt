import type {creditCardProps} from "../types/CreditCardProps.ts";

const useCreditCard = (props: creditCardProps) => {

    const {
        tariffId,
        principalAmount, // Сумма крдита
        outstandingAmount, // Остаток
        status,
        issuedAt,
        nextPaymentDueAt,
        createdAt
    } = props

    const remainsPercantage = (outstandingAmount / principalAmount) * 100;



    return {
        tariffId,
        principalAmount,
        outstandingAmount,
        status,
        issuedAt,
        nextPaymentDueAt,
        createdAt,
        remainsPercantage
    }
}

export { useCreditCard }