import type {Account} from "../../../../types/account/Account.ts";

type AccountProps = Omit<Account, 'createdAt'> & {
    isHidden?: boolean
}

export type { AccountProps };