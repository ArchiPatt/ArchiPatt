import * as events from "../services/events";
import { parseIngestPayload } from "../http/ingestNormalize";

export type IngestControllerResult =
  | { status: 200; body: { ok: true; accepted: number } }
  | { status: 400; body: { error: string } };

export async function ingestController(body: unknown): Promise<IngestControllerResult> {
  const parsed = parseIngestPayload(body);
  if (parsed.kind === "invalid_body") {
    return { status: 400, body: { error: "invalid_body" } };
  }
  if (parsed.kind === "invalid_event") {
    return { status: 400, body: { error: "invalid_event" } };
  }
  if (parsed.kind === "batch") {
    await events.ingestBatch(parsed.events);
    return { status: 200, body: { ok: true, accepted: parsed.events.length } };
  }
  await events.ingestOne(parsed.event);
  return { status: 200, body: { ok: true, accepted: 1 } };
}
