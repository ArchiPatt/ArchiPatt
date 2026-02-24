import type {AccountType} from "@/components/AccountCard/types/AccountType.ts";

interface AccountProps {
    id: string
    clientId: string
    balance: string
    status: AccountType
    createdAt: Date
}

export type { AccountProps }