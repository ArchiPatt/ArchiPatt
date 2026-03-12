import { DataSource } from "typeorm";
import { getChannel, QUEUE_NAME } from "./connection";
import * as pendingReplies from "./pending-replies";
import type { OperationCommand, OperationReply } from "./types";
import * as accountsService from "../services/accounts";
import { env } from "../env";
import { notifyNewOperation } from "../ws/account-operations-broadcast";
import type { AccountOperation } from "../db/entities/AccountOperation";

function replyOk(
  status: number,
  body?: unknown,
  extra?: Partial<OperationReply>,
): OperationReply {
  return { ok: true, status: status ?? 200, body, ...extra };
}

function replyErr(status: number, error: string): OperationReply {
  return { ok: false, status, error };
}

export async function startOperationConsumer(ds: DataSource): Promise<void> {
  const ch = await getChannel();
  ch.prefetch(1);
  await ch.consume(
    QUEUE_NAME,
    async (msg) => {
      if (!msg) return;
      let correlationId: string;
      let command: OperationCommand;
      try {
        const raw = JSON.parse(
          msg.content.toString("utf8"),
        ) as OperationCommand;
        correlationId = raw.correlationId;
        command = raw;
      } catch {
        ch.nack(msg, false, false);
        return;
      }

      try {
        const reply = await processCommand(ds, command);
        pendingReplies.resolve(correlationId, reply);
        ch.ack(msg);
      } catch (err) {
        pendingReplies.resolve(correlationId, replyErr(500, "internal_error"));
        ch.ack(msg);
      }
    },
    { noAck: false },
  );
}

async function processCommand(
  ds: DataSource,
  command: OperationCommand,
): Promise<OperationReply> {
  switch (command.kind) {
    case "deposit": {
      const result = await ds.manager.transaction((em) =>
        accountsService.deposit(
          em,
          command.accountId,
          command.amount,
          command.correlationId,
        ),
      );
      if (!result) return replyErr(404, "account_not_found");
      if (result === "closed") return replyErr(400, "account_closed");
      notifyNewOperation(command.accountId, result.operation);
      return replyOk(200, result.account, { operation: result.operation });
    }

    case "withdraw": {
      const result = await ds.manager.transaction((em) =>
        accountsService.withdraw(
          em,
          command.accountId,
          command.amount,
          command.correlationId,
        ),
      );
      if (!result) return replyErr(404, "account_not_found");
      if (result === "closed") return replyErr(400, "account_closed");
      if (result === "insufficient_balance")
        return replyErr(400, "insufficient_balance");
      notifyNewOperation(command.accountId, result.operation);
      return replyOk(200, result.account, { operation: result.operation });
    }

    case "post_operation": {
      const result = await ds.manager.transaction((em) =>
        accountsService.postOperation(em, {
          accountId: command.accountId,
          amount: command.amount,
          type: command.type ?? null,
          correlationId: command.operationCorrelationId ?? null,
          idempotencyKey: command.idempotencyKey,
          meta: command.meta ?? null,
        }),
      );
      if (result === null) return replyErr(404, "account_not_found");
      if (result === "closed") return replyErr(400, "account_closed");
      if (result === "insufficient_balance")
        return replyErr(400, "insufficient_balance");
      notifyNewOperation(command.accountId, result.op as AccountOperation);
      return replyOk(result.created ? 201 : 200, result.op, {
        operation: result.op,
      });
    }

    case "transfer": {
      const result = await ds.manager.transaction((em) =>
        accountsService.transferBetweenAccounts(em, {
          fromAccountId: command.fromAccountId,
          toAccountId: command.toAccountId,
          amount: command.amount,
          idempotencyKey: command.idempotencyKey ?? null,
        }),
      );
      if (result === "same_account") return replyErr(400, "same_account");
      if (result === null || result === "account_not_found")
        return replyErr(404, "account_not_found");
      if (result === "closed") return replyErr(400, "account_closed");
      if (result === "insufficient_balance")
        return replyErr(400, "insufficient_balance");
      if (result === "exchange_rate_unavailable")
        return replyErr(503, "exchange_rate_unavailable");
      notifyNewOperation(command.fromAccountId, result.fromOperation);
      notifyNewOperation(command.toAccountId, result.toOperation);
      return replyOk(
        200,
        { ok: true },
        {
          fromOperation: result.fromOperation,
          toOperation: result.toOperation,
        },
      );
    }

    case "transfer_from_master": {
      const result = await ds.manager.transaction((em) =>
        accountsService.transferFromMaster(em, {
          masterAccountId: env.masterAccountId,
          toAccountId: command.toAccountId,
          amount: command.amount,
          idempotencyKey: command.idempotencyKey,
          type: command.type ?? null,
          meta: command.meta ?? null,
        }),
      );
      if (result === null) return replyErr(404, "account_not_found");
      if (result === "closed") return replyErr(400, "account_closed");
      if (result === "insufficient_balance")
        return replyErr(400, "insufficient_balance");
      if (result === "exchange_rate_unavailable")
        return replyErr(503, "exchange_rate_unavailable");
      notifyNewOperation(command.toAccountId, result.toAccountOperation);
      return replyOk(
        200,
        { ok: true },
        {
          toAccountOperation: result.toAccountOperation,
        },
      );
    }

    case "transfer_to_master": {
      const result = await ds.manager.transaction((em) =>
        accountsService.transferToMaster(em, {
          masterAccountId: env.masterAccountId,
          fromAccountId: command.fromAccountId,
          amount: command.amount,
          idempotencyKey: command.idempotencyKey,
          type: command.type ?? null,
          meta: command.meta ?? null,
        }),
      );
      if (result === null) return replyErr(404, "account_not_found");
      if (result === "closed") return replyErr(400, "account_closed");
      if (result === "insufficient_balance")
        return replyErr(400, "insufficient_balance");
      if (result === "exchange_rate_unavailable")
        return replyErr(503, "exchange_rate_unavailable");
      notifyNewOperation(command.fromAccountId, result.fromAccountOperation);
      return replyOk(
        200,
        { ok: true },
        {
          fromAccountOperation: result.fromAccountOperation,
        },
      );
    }

    default:
      return replyErr(400, "unknown_command");
  }
}
