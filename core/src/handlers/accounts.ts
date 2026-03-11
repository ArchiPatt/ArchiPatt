import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { env } from "../env";
import { authPayloadOrNull } from "../controllers/auth";
import {
  listAccountsController,
  getAccountController,
  getOperationsController,
  createAccountController,
  closeAccountController,
  depositController,
  withdrawController,
  transferController,
  internalPostOperationController,
  internalTransferFromMasterController,
  internalTransferToMasterController,
} from "../controllers/accounts";
import { notifyNewOperation } from "../ws/account-operations-broadcast";
import type { AccountOperation } from "../db/entities/AccountOperation";

export function createAccountsHandlers(app: FastifyInstance) {
  return {
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
      req: FastifyRequest<{ Body: { clientId?: string } }>,
      reply: FastifyReply,
    ) => {
      const auth = await authPayloadOrNull(req);
      if (!auth.ok) return reply.code(auth.code).send({ error: auth.error });
      const res = await createAccountController(app.db, auth.payload, {
        clientId: req.body?.clientId,
      });
      return reply.code(res.status).send(res.body);
    },

    close: async (
      req: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply,
    ) => {
      const auth = await authPayloadOrNull(req);
      if (!auth.ok) return reply.code(auth.code).send({ error: auth.error });
      const res = await closeAccountController(
        app.db,
        auth.payload,
        req.params,
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
      const res = await depositController(app.db, auth.payload, {
        ...req.params,
        amount: req.body?.amount,
      });
      if (res.status === 200 && "operation" in res && res.operation) {
        notifyNewOperation(req.params.id, res.operation);
      }
      return reply.code(res.status).send(res.body);
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
      const res = await withdrawController(app.db, auth.payload, {
        ...req.params,
        amount: req.body?.amount,
      });
      if (res.status === 200 && "operation" in res && res.operation) {
        notifyNewOperation(req.params.id, res.operation);
      }
      return reply.code(res.status).send(res.body);
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
      const res = await transferController(app.db, auth.payload, {
        fromAccountId: req.body?.fromAccountId,
        toAccountId: req.body?.toAccountId,
        amount: req.body?.amount,
        idempotencyKey: req.body?.idempotencyKey,
      });
      if (
        res.status === 200 &&
        "fromOperation" in res &&
        res.fromOperation &&
        "toOperation" in res &&
        res.toOperation &&
        req.body?.fromAccountId &&
        req.body?.toAccountId
      ) {
        notifyNewOperation(req.body.fromAccountId, res.fromOperation);
        notifyNewOperation(req.body.toAccountId, res.toOperation);
      }
      return reply.code(res.status).send(res.body);
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
      const res = await internalPostOperationController(app.db, internalOk, {
        ...req.params,
        ...req.body,
      });
      if ((res.status === 200 || res.status === 201) && res.body) {
        notifyNewOperation(req.params.id, res.body as AccountOperation);
      }
      return reply.code(res.status).send(res.body);
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
      const amount =
        typeof req.body?.amount === "number"
          ? req.body.amount
          : typeof req.body?.amount === "string"
            ? parseFloat(req.body.amount)
            : NaN;
      if (
        !req.body?.toAccountId ||
        !Number.isFinite(amount) ||
        amount <= 0 ||
        !req.body?.idempotencyKey
      ) {
        return reply.code(400).send({ error: "invalid_input" });
      }
      const res = await internalTransferFromMasterController(
        app.db,
        internalOk,
        {
          toAccountId: req.body.toAccountId,
          amount,
          idempotencyKey: req.body.idempotencyKey,
          type: req.body.type,
          meta: req.body.meta,
        },
      );
      if (
        res.status === 200 &&
        "toAccountOperation" in res &&
        res.toAccountOperation &&
        req.body.toAccountId
      ) {
        notifyNewOperation(req.body.toAccountId, res.toAccountOperation);
      }
      return reply.code(res.status).send(res.body);
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
      const amount =
        typeof req.body?.amount === "number"
          ? req.body.amount
          : typeof req.body?.amount === "string"
            ? parseFloat(req.body.amount)
            : NaN;
      if (
        !req.body?.fromAccountId ||
        !Number.isFinite(amount) ||
        amount <= 0 ||
        !req.body?.idempotencyKey
      ) {
        return reply.code(400).send({ error: "invalid_input" });
      }
      const res = await internalTransferToMasterController(app.db, internalOk, {
        fromAccountId: req.body.fromAccountId,
        amount,
        idempotencyKey: req.body.idempotencyKey,
        type: req.body.type,
        meta: req.body.meta,
      });
      if (
        res.status === 200 &&
        "fromAccountOperation" in res &&
        res.fromAccountOperation &&
        req.body.fromAccountId
      ) {
        notifyNewOperation(req.body.fromAccountId, res.fromAccountOperation);
      }
      return reply.code(res.status).send(res.body);
    },
  };
}
