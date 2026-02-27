import type {accountStatus} from "../../../types/accountStatus.ts";

interface Account {
    id: string
    clientId: string
    balance: string
    status: accountStatus
    createdAt: string
}

export type { Account }