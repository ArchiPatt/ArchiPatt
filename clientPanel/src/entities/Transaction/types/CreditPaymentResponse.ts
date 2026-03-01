import type {PaymentType} from "../../Credit/types/PaymentType.ts";

interface CreditPaymentResponse {
    id: string
    creditId: string
    amount: string
    paymentType:PaymentType
    performedBy: string
    performedAt: string
    createdAt: string
}

export type { CreditPaymentResponse }