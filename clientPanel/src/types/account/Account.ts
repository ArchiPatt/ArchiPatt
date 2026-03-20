import type {AccountStatus} from "./AccountStatus.ts";
import type {Currency} from "./Currency.ts";

interface Account {
    id: string
    clientId: string
    currency: Currency
    balance: string
    status: AccountStatus
    createdAt: string
}

export type { Account }