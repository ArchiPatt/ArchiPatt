import type {AccountStatus} from "./AccountStatus.ts";

interface Account {
    id: string
    clientId: string
    balance: string
    status: AccountStatus
    createdAt: string
}

export type { Account }