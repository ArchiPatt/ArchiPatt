import type { FastifyInstance, FastifyRequest } from "fastify";
import type { JWTPayload } from "jose";
import WebSocket from "ws";
import { verifyBearerToken } from "../security/jwt";
import { canReadAccount } from "../security/access";
import * as accountsService from "../services/accounts";
import {
  subscribe as subscribeToBroadcast,
  operationToPayload,
  type OperationPayload,
} from "../ws/account-operations-broadcast";
import { makeWsTextSender } from "../ws/wsSend";

const SNAPSHOT_LIMIT = 50;
const SNAPSHOT_SORT = "DESC" as const;

interface SnapshotMessage {
  type: "snapshot";
  items: OperationPayload[];
  total: number;
}

export function registerWsAccountsRoutes(app: FastifyInstance): void {
  app.get<{
    Params: { id: string };
    Querystring: { authorization?: string };
  }>(
    "/ws/accounts/:id/operations",
    { websocket: true },
    async (
      socket: WebSocket,
      request: FastifyRequest<{
        Params: { id: string };
        Querystring: { authorization?: string };
      }>,
    ) => {
      const accountId = request.params.id;
      const authHeader =
        request.headers.authorization ?? request.query?.authorization ?? "";

      const payload: JWTPayload | null = await verifyBearerToken(
        typeof authHeader === "string" ? authHeader : "",
      );
      if (!payload?.sub) {
        socket.send(JSON.stringify({ type: "error", error: "unauthorized" }));
        socket.close(1008, "Unauthorized");
        return;
      }

      const account = await accountsService.findAccountById(app.db, accountId);
      if (!account) {
        socket.send(
          JSON.stringify({ type: "error", error: "account_not_found" }),
        );
        socket.close(1008, "Not found");
        return;
      }

      if (!canReadAccount(payload, account.clientId)) {
        socket.send(JSON.stringify({ type: "error", error: "forbidden" }));
        socket.close(1008, "Forbidden");
        return;
      }

      const send = makeWsTextSender(socket);
      const unsubscribe = subscribeToBroadcast(accountId, send);
      socket.on("close", () => {
        unsubscribe();
      });

      const { items, total } = await accountsService.findOperations(
        app.db,
        accountId,
        {
          limit: SNAPSHOT_LIMIT,
          offset: 0,
          sort: SNAPSHOT_SORT,
        },
      );

      const snapshot: SnapshotMessage = {
        type: "snapshot",
        items: items.map(operationToPayload),
        total,
      };

      send(JSON.stringify(snapshot));
    },
  );
}
