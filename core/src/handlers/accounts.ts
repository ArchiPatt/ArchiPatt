import crypto from "node:crypto";
import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { env } from "../env";
import { authPayloadOrNull } from "../controllers/auth";
import {
  idempotencyKeyFromRequest,
  mergeIdempotencyKey,
} from "../http/idempotencyHeaders";
import { replayOrRun } from "../services/idempotencyReplay";
import {
  listAccountsController,
  getAccountController,
  getMasterAccountController,
  getOperationsController,
  createAccountController,
  closeAccountController,
} from "../controllers/accounts";
import * as accountsService from "../services/accounts";
import { SUPPORTED_CURRENCIES } from "../db/enums/Currency";
import { publishOperationCommand, registerPendingReply } from "../messaging";
import type { OperationReply } from "../messaging";

function sendOperationReply(reply: FastifyReply, result: OperationReply): void {
  const status = result.status ?? (result.ok ? 200 : 500);
  const body = result.ok ? result.body : { error: result.error };
  reply.code(status).send(body);
}

export function createAccountsHandlers(app: FastifyInstance) {
  return {
    listCurrencies: async (_req: FastifyRequest, reply: FastifyReply) => {
      return reply.code(200).send({ currencies: [...SUPPORTED_CURRENCIES] });
    },
    list: async (
      req: FastifyRequest<{ Querystring: { clientId?: string } }>,
      reply: FastifyReply,
    ) => {
      const auth = await authPayloadOrNull(req);
      if (!auth.ok) return reply.code(auth.code).send({ error: auth.error });
      const res = await listAccountsController(app.db, auth.payload, {
        clientId: req.query.clientId,
      });
      return reply.code(res.status).send(res.body);
    },

    get: async (
      req: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply,
    ) => {
      const auth = await authPayloadOrNull(req);
      if (!auth.ok) return reply.code(auth.code).send({ error: auth.error });
      const res = await getAccountController(app.db, auth.payload, req.params);
      return reply.code(res.status).send(res.body);
    },

    getMaster: async (req: FastifyRequest, reply: FastifyReply) => {
      const auth = await authPayloadOrNull(req);
      if (!auth.ok) return reply.code(auth.code).send({ error: auth.error });
      const res = await getMasterAccountController(app.db, auth.payload);
      return reply.code(res.status).send(res.body);
    },

    getOperations: async (
      req: FastifyRequest<{
        Params: { id: string };
        Querystring: { limit?: string; offset?: string; sort?: string };
      }>,
      reply: FastifyReply,
    ) => {
      const auth = await authPayloadOrNull(req);
      if (!auth.ok) return reply.code(auth.code).send({ error: auth.error });
      const limit = parseInt(req.query.limit ?? "20", 10) || 20;
      const offset = parseInt(req.query.offset ?? "0", 10) || 0;
      const res = await getOperationsController(app.db, auth.payload, {
        ...req.params,
        limit,
        offset,
        sort: req.query.sort,
      });
      return reply.code(res.status).send(res.body);
    },

    create: async (
      req: FastifyRequest<{
        Body: { clientId?: string; currency?: string };
      }>,
      reply: FastifyReply,
    ) => {
      const auth = await authPayloadOrNull(req);
      if (!auth.ok) return reply.code(auth.code).send({ error: auth.error });
      const key = idempotencyKeyFromRequest(req);
      const res = await replayOrRun(app.db, key, "POST /accounts", () =>
        createAccountController(app.db, auth.payload, {
          clientId: req.body?.clientId,
          currency: req.body?.currency,
        }),
      );
      return reply.code(res.status).send(res.body);
    },

    close: async (
      req: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply,
    ) => {
      const auth = await authPayloadOrNull(req);
      if (!auth.ok) return reply.code(auth.code).send({ error: auth.error });
      const key = idempotencyKeyFromRequest(req);
      const res = await replayOrRun(
        app.db,
        key,
        `POST /accounts/${req.params.id}/close`,
        () => closeAccountController(app.db, auth.payload, req.params),
      );
      return reply.code(res.status).send(res.body);
    },

    deposit: async (
      req: FastifyRequest<{
        Params: { id: string };
        Body: { amount?: unknown };
      }>,
      reply: FastifyReply,
    ) => {
      const auth = await authPayloadOrNull(req);
      if (!auth.ok) return reply.code(auth.code).send({ error: auth.error });
      const accountRes = await getAccountController(app.db, auth.payload, {
        id: req.params.id,
      });
      if (accountRes.status !== 200) {
        return reply.code(accountRes.status).send(accountRes.body);
      }
      const amount = accountsService.parseAmount(req.body?.amount);
      if (amount == null)
        return reply.code(400).send({ error: "invalid_amount" });
      const correlationId = crypto.randomUUID();
      const resultPromise = registerPendingReply(correlationId);
      const idempotencyKey =
        mergeIdempotencyKey(undefined, idempotencyKeyFromRequest(req)) ??
        correlationId;
      await publishOperationCommand({
        kind: "deposit",
        correlationId,
        accountId: req.params.id,
        amount,
        idempotencyKey,
      });
      try {
        const result = await resultPromise;
        sendOperationReply(reply, result);
      } catch (err) {
        reply.code(503).send({ error: "operation_timeout" });
      }
    },

    withdraw: async (
      req: FastifyRequest<{
        Params: { id: string };
        Body: { amount?: unknown };
      }>,
      reply: FastifyReply,
    ) => {
      const auth = await authPayloadOrNull(req);
      if (!auth.ok) return reply.code(auth.code).send({ error: auth.error });
      const accountRes = await getAccountController(app.db, auth.payload, {
        id: req.params.id,
      });
      if (accountRes.status !== 200) {
        return reply.code(accountRes.status).send(accountRes.body);
      }
      const amount = accountsService.parseAmount(req.body?.amount);
      if (amount == null)
        return reply.code(400).send({ error: "invalid_amount" });
      const correlationId = crypto.randomUUID();
      const resultPromise = registerPendingReply(correlationId);
      const idempotencyKey =
        mergeIdempotencyKey(undefined, idempotencyKeyFromRequest(req)) ??
        correlationId;
      await publishOperationCommand({
        kind: "withdraw",
        correlationId,
        accountId: req.params.id,
        amount,
        idempotencyKey,
      });
      try {
        const result = await resultPromise;
        sendOperationReply(reply, result);
      } catch (err) {
        reply.code(503).send({ error: "operation_timeout" });
      }
    },

    transfer: async (
      req: FastifyRequest<{
        Body: {
          fromAccountId?: string;
          toAccountId?: string;
          amount?: unknown;
          idempotencyKey?: string;
        };
      }>,
      reply: FastifyReply,
    ) => {
      const auth = await authPayloadOrNull(req);
      if (!auth.ok) return reply.code(auth.code).send({ error: auth.error });
      const amount = accountsService.parseAmount(req.body?.amount);
      if (amount == null)
        return reply.code(400).send({ error: "invalid_amount" });
      const fromAccountId = req.body?.fromAccountId;
      const toAccountId = req.body?.toAccountId;
      if (!fromAccountId || !toAccountId) {
        return reply
          .code(400)
          .send({ error: "from_account_id_and_to_account_id_required" });
      }
      const fromRes = await getAccountController(app.db, auth.payload, {
        id: fromAccountId,
      });
      if (fromRes.status !== 200) {
        return reply.code(fromRes.status).send(fromRes.body);
      }
      const toRes = await getAccountController(app.db, auth.payload, {
        id: toAccountId,
      });
      if (toRes.status !== 200) {
        return reply.code(toRes.status).send(toRes.body);
      }
      const correlationId = crypto.randomUUID();
      const resultPromise = registerPendingReply(correlationId);
      const idempotencyKey =
        mergeIdempotencyKey(
          req.body?.idempotencyKey,
          idempotencyKeyFromRequest(req),
        ) ?? null;
      await publishOperationCommand({
        kind: "transfer",
        correlationId,
        fromAccountId,
        toAccountId,
        amount,
        idempotencyKey,
      });
      try {
        const result = await resultPromise;
        sendOperationReply(reply, result);
      } catch (err) {
        reply.code(503).send({ error: "operation_timeout" });
      }
    },

    internalPostOperation: async (
      req: FastifyRequest<{
        Params: { id: string };
        Body: {
          amount?: unknown;
          idempotencyKey?: string;
          type?: string;
          correlationId?: string;
          meta?: Record<string, unknown>;
        };
      }>,
      reply: FastifyReply,
    ) => {
      const internalOk = req.headers["x-internal-token"] === env.internalToken;
      if (!internalOk) return reply.code(401).send({ error: "unauthorized" });
      const idempotencyKey = mergeIdempotencyKey(
        req.body?.idempotencyKey,
        idempotencyKeyFromRequest(req),
      )?.trim();
      if (!idempotencyKey)
        return reply.code(400).send({ error: "idempotency_key_required" });
      const n =
        typeof req.body?.amount === "string"
          ? parseFloat(req.body.amount)
          : typeof req.body?.amount === "number"
            ? req.body.amount
            : NaN;
      if (!Number.isFinite(n) || n === 0)
        return reply.code(400).send({ error: "invalid_amount" });
      const correlationId = crypto.randomUUID();
      const resultPromise = registerPendingReply(correlationId);
      await publishOperationCommand({
        kind: "post_operation",
        correlationId,
        accountId: req.params.id,
        amount: n,
        type: req.body?.type ?? null,
        idempotencyKey,
        operationCorrelationId: req.body?.correlationId ?? null,
        meta: req.body?.meta ?? null,
      });
      try {
        const result = await resultPromise;
        sendOperationReply(reply, result);
      } catch (err) {
        reply.code(503).send({ error: "operation_timeout" });
      }
    },

    internalTransferFromMaster: async (
      req: FastifyRequest<{
        Body: {
          toAccountId?: string;
          amount?: unknown;
          idempotencyKey?: string;
          type?: string;
          meta?: Record<string, unknown>;
        };
      }>,
      reply: FastifyReply,
    ) => {
      const internalOk = req.headers["x-internal-token"] === env.internalToken;
      if (!internalOk) return reply.code(401).send({ error: "unauthorized" });
      const amount =
        typeof req.body?.amount === "number"
          ? req.body.amount
          : typeof req.body?.amount === "string"
            ? parseFloat(req.body.amount)
            : NaN;
      const idempotencyKey = mergeIdempotencyKey(
        req.body?.idempotencyKey,
        idempotencyKeyFromRequest(req),
      )?.trim();
      if (
        !req.body?.toAccountId ||
        !Number.isFinite(amount) ||
        amount <= 0 ||
        !idempotencyKey
      ) {
        return reply.code(400).send({ error: "invalid_input" });
      }
      const correlationId = crypto.randomUUID();
      const resultPromise = registerPendingReply(correlationId);
      await publishOperationCommand({
        kind: "transfer_from_master",
        correlationId,
        toAccountId: req.body.toAccountId,
        amount,
        idempotencyKey,
        type: req.body.type,
        meta: req.body.meta,
      });
      try {
        const result = await resultPromise;
        sendOperationReply(reply, result);
      } catch (err) {
        reply.code(503).send({ error: "operation_timeout" });
      }
    },

    internalTransferToMaster: async (
      req: FastifyRequest<{
        Body: {
          fromAccountId?: string;
          amount?: unknown;
          idempotencyKey?: string;
          type?: string;
          meta?: Record<string, unknown>;
        };
      }>,
      reply: FastifyReply,
    ) => {
      const internalOk = req.headers["x-internal-token"] === env.internalToken;
      if (!internalOk) return reply.code(401).send({ error: "unauthorized" });
      const amount =
        typeof req.body?.amount === "number"
          ? req.body.amount
          : typeof req.body?.amount === "string"
            ? parseFloat(req.body.amount)
            : NaN;
      const idempotencyKey = mergeIdempotencyKey(
        req.body?.idempotencyKey,
        idempotencyKeyFromRequest(req),
      )?.trim();
      if (
        !req.body?.fromAccountId ||
        !Number.isFinite(amount) ||
        amount <= 0 ||
        !idempotencyKey
      ) {
        return reply.code(400).send({ error: "invalid_input" });
      }
      const correlationId = crypto.randomUUID();
      const resultPromise = registerPendingReply(correlationId);
      await publishOperationCommand({
        kind: "transfer_to_master",
        correlationId,
        fromAccountId: req.body.fromAccountId,
        amount,
        idempotencyKey,
        type: req.body.type,
        meta: req.body.meta,
      });
      try {
        const result = await resultPromise;
        sendOperationReply(reply, result);
      } catch (err) {
        reply.code(503).send({ error: "operation_timeout" });
      }
    },
  };
}
