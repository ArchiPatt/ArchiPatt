import { getChannel, QUEUE_NAME } from "./connection";
import type { OperationCommand } from "./types";

export async function publishOperationCommand(
  command: OperationCommand,
): Promise<void> {
  const ch = await getChannel();
  const payload = Buffer.from(JSON.stringify(command), "utf8");
  ch.sendToQueue(QUEUE_NAME, payload, {
    persistent: true,
    contentType: "application/json",
  });
}
