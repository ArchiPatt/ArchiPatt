import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { tokenStorage } from "../../../shared/storage/tokenStorage";
import type { AccountOperation } from "../../../../generated/api/core";

const GATEWAY_WS =
  (import.meta.env.VITE_GATEWAY_WS_URL as string | undefined)?.replace(
    /\/$/,
    "",
  ) || "ws://localhost:4004";

/**
 * Все операции по счетам текущего клиента (роль `client`), без указания id счёта.
 * Соответствует Core `GET /ws/client/operations` через gateway.
 */
const useClientOperationsWS = () => {
  const [operations, setOperations] = useState<AccountOperation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    const token = tokenStorage.getItem();
    const socket = new WebSocket(
      `${GATEWAY_WS}/ws/client/operations?authorization=${encodeURIComponent(`Bearer ${token ?? ""}`)}`,
    );
    socket.onopen = () => {
      setIsLoading(false);
    };
    socket.onmessage = (event) => {
      let data: {
        type?: string;
        items?: unknown;
        operation?: AccountOperation;
      };
      try {
        data = JSON.parse(String(event.data)) as typeof data;
      } catch {
        return;
      }
      if (data.type === "snapshot") {
        setOperations(Array.isArray(data.items) ? data.items : []);
      }
      if (data.type === "operation_added" && data.operation) {
        const op = data.operation;
        setOperations((prev) => [op, ...prev]);
        queryClient.invalidateQueries({ queryKey: ["account"] });
      }
    };
    return () => {
      socket.close();
    };
  }, [queryClient]);

  return { operations, isLoading };
};

export { useClientOperationsWS };
