export type OperationCommand =
  | DepositCommand
  | WithdrawCommand
  | PostOperationCommand
  | TransferCommand
  | TransferFromMasterCommand
  | TransferToMasterCommand;

export interface BaseCommand {
  correlationId: string;
}

export interface DepositCommand extends BaseCommand {
  kind: "deposit";
  accountId: string;
  amount: number;
  idempotencyKey?: string | null;
}

export interface WithdrawCommand extends BaseCommand {
  kind: "withdraw";
  accountId: string;
  amount: number;
  idempotencyKey?: string | null;
}

export interface PostOperationCommand extends BaseCommand {
  kind: "post_operation";
  accountId: string;
  amount: number;
  type?: string | null;
  idempotencyKey: string;
  operationCorrelationId?: string | null;
  meta?: Record<string, unknown> | null;
}

export interface TransferCommand extends BaseCommand {
  kind: "transfer";
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  idempotencyKey?: string | null;
}

export interface TransferFromMasterCommand extends BaseCommand {
  kind: "transfer_from_master";
  toAccountId: string;
  amount: number;
  idempotencyKey: string;
  type?: string | null;
  meta?: Record<string, unknown> | null;
}

export interface TransferToMasterCommand extends BaseCommand {
  kind: "transfer_to_master";
  fromAccountId: string;
  amount: number;
  idempotencyKey: string;
  type?: string | null;
  meta?: Record<string, unknown> | null;
}

export interface OperationReply {
  ok: boolean;
  status?: number;
  body?: unknown;
  operation?: unknown;
  fromOperation?: unknown;
  toOperation?: unknown;
  toAccountOperation?: unknown;
  fromAccountOperation?: unknown;
  error?: string;
}
