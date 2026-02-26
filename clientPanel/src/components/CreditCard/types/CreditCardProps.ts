import type {creditResponse} from "../../../types/creditResponse.ts";

type creditCardProps = Pick<creditResponse, 'clientId' | 'accountId' | 'id' | 'closedAt'>

export type { creditCardProps }