import type { FastifyInstance, FastifyRequest } from "fastify";
import type { JWTPayload } from "jose";
import WebSocket from "ws";
import { verifyBearerToken } from "../security/jwt";
import { canUseClientOperationsStream } from "../security/access";
import * as accountsService from "../services/accounts";
import {
  subscribeClient,
  operationToPayload,
  type OperationPayload,
} from "../ws/account-operations-broadcast";
import { makeWsTextSender } from "../ws/wsSend";

const SNAPSHOT_LIMIT = 80;
const SNAPSHOT_SORT = "DESC" as const;

interface SnapshotMessage {
  type: "snapshot";
  items: OperationPayload[];
  total: number;
}

/**
 * Поток операций по всем счетам залогиненного клиента (роль `client`).
 * Сотрудники используют `/ws/staff/operations`.
 */
export function registerWsClientOperationsRoutes(app: FastifyInstance): void {
  app.get<{
    Querystring: { authorization?: string };
  }>(
    "/ws/client/operations",
    { websocket: true },
    async (
      socket: WebSocket,
      request: FastifyRequest<{
        Querystring: { authorization?: string };
      }>,
    ) => {
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

      if (!canUseClientOperationsStream(payload)) {
        socket.send(JSON.stringify({ type: "error", error: "forbidden" }));
        socket.close(1008, "Forbidden");
        return;
      }

      const clientId = payload.sub;
      const send = makeWsTextSender(socket);
      const unsubscribe = subscribeClient(clientId, send);
      socket.on("close", () => {
        unsubscribe();
      });

      const { items, total } = await accountsService.findRecentOperationsForClient(
        app.db,
        clientId,
        { limit: SNAPSHOT_LIMIT },
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
