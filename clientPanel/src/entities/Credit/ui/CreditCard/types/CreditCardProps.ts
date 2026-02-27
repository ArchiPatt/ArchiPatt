import type {creditResponse} from "../../../../../types/creditResponse.ts";

type CreditCardProps = Omit<creditResponse, 'clientId' | 'accountId' | 'id' | 'closedAt'>

export type { CreditCardProps }