import type {PaymentType} from "../../Credit/types/PaymentType.ts";

interface TransactionType {
    id: string
    amount: string
    type: string | PaymentType
    createdAt: string
}

export type { TransactionType }