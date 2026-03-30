import type {Account} from "../../../../../generated/api/core";

type AccountProps = Omit<Account, 'createdAt'> & {
    isHidden?: boolean
}

export type { AccountProps };