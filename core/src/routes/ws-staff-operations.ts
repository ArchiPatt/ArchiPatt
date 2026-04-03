import type { FastifyInstance, FastifyRequest } from "fastify";
import type { JWTPayload } from "jose";
import WebSocket from "ws";
import { verifyBearerToken } from "../security/jwt";
import { canManageAll } from "../security/access";
import * as accountsService from "../services/accounts";
import {
  subscribeGlobal,
  operationToPayload,
  type OperationPayload,
} from "../ws/account-operations-broadcast";
import { makeWsTextSender } from "../ws/wsSend";

const SNAPSHOT_LIMIT = 80;

interface SnapshotMessage {
  type: "snapshot";
  items: OperationPayload[];
  total: number;
}

/**
 * Поток новых операций по всем клиентам – только employee/admin.
 * Дополняет per-account WS; для сотруднических панелей.
 */
export function registerWsStaffOperationsRoutes(app: FastifyInstance): void {
  app.get<{
    Querystring: { authorization?: string };
  }>(
    "/ws/staff/operations",
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

      if (!canManageAll(payload)) {
        socket.send(JSON.stringify({ type: "error", error: "forbidden" }));
        socket.close(1008, "Forbidden");
        return;
      }

      const send = makeWsTextSender(socket);
      const unsubscribe = subscribeGlobal(send);
      socket.on("close", () => {
        unsubscribe();
      });

      const { items, total } =
        await accountsService.findRecentOperationsGlobally(app.db, {
          limit: SNAPSHOT_LIMIT,
        });

      const snapshot: SnapshotMessage = {
        type: "snapshot",
        items: items.map(operationToPayload),
        total,
      };

      send(JSON.stringify(snapshot));
    },
  );
}
