import type {Account} from "../../../types/Account.ts";

type AccountProps = Omit<Account, 'createdAt'>

export type { AccountProps };