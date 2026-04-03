import WebSocket from "ws";

/**
 * Отправка текстового кадра: в OPEN – сразу, в CONNECTING – после `open`,
 * чтобы не терять снапшот и прочие сообщения.
 */
export function makeWsTextSender(socket: WebSocket): (data: string) => void {
  return (data: string) => {
    try {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(data);
        return;
      }
      if (socket.readyState === WebSocket.CONNECTING) {
        socket.once("open", () => {
          try {
            if (socket.readyState === WebSocket.OPEN) socket.send(data);
          } catch {}
        });
      }
    } catch {}
  };
}
