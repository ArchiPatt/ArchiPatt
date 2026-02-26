import type {accountStatus} from "./accountStatus.ts";

interface account {
    id: string
    clientId: string
    balance: string
    status: accountStatus
    createdAt: string
}

export type { account }