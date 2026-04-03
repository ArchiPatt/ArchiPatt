import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { env } from "../env";
import {
  CIRCUIT_GATEWAY_ADMIN_SETTINGS,
  CIRCUIT_GATEWAY_AUTH,
  CIRCUIT_GATEWAY_CLIENT_SETTINGS,
  CIRCUIT_GATEWAY_CORE,
  CIRCUIT_GATEWAY_CREDITS,
  CIRCUIT_GATEWAY_USERS,
  resilientFetch,
} from "./resilientFetch";

const HOP_REQUEST = new Set([
  "connection",
  "keep-alive",
  "transfer-encoding",
  "te",
  "trailer",
  "upgrade",
  "host",
  "content-length",
]);

const HOP_RESPONSE = new Set([
  "connection",
  "transfer-encoding",
  "keep-alive",
  "te",
  "trailer",
]);

function buildForwardHeaders(
  req: FastifyRequest,
  traceId: string,
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(req.headers)) {
    const lk = k.toLowerCase();
    if (HOP_REQUEST.has(lk)) continue;
    if (v === undefined) continue;
    const val = Array.isArray(v) ? v.join(", ") : v;
    if (!val) continue;
    out[k] = val.replace(/[\r\n]/g, "");
  }
  out["x-trace-id"] = traceId;
  return out;
}

async function forwardOnce(
  req: FastifyRequest,
  reply: FastifyReply,
  upstreamBase: string,
  circuitName: string,
): Promise<void> {
  const pathAndQuery = req.raw.url ?? "/";
  const base = upstreamBase.replace(/\/$/, "");
  const target = `${base}${pathAndQuery}`;

  const method = (req.method ?? "GET").toUpperCase();
  let body: Buffer | undefined;
  if (!["GET", "HEAD", "OPTIONS"].includes(method)) {
    const raw = req.body;
    if (Buffer.isBuffer(raw) && raw.length > 0) body = raw;
  }

  const headers = new Headers();
  for (const [k, v] of Object.entries(buildForwardHeaders(req, req.traceId))) {
    headers.set(k, v);
  }

  const init: RequestInit = {
    method,
    headers,
    redirect: "manual",
  };
  if (body !== undefined) {
    init.body = new Uint8Array(body);
  }

  const res = await resilientFetch(circuitName, target, init);

  reply.code(res.status);
  for (const [k, v] of res.headers.entries()) {
    const lk = k.toLowerCase();
    if (HOP_RESPONSE.has(lk)) continue;
    if (lk === "content-length") continue;
    reply.header(k, v);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  return reply.send(buf);
}

function registerPrefix(
  app: FastifyInstance,
  prefix: string,
  upstream: string,
  circuit: string,
): void {
  const handler = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      await forwardOnce(req, reply, upstream, circuit);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes("circuit open")) {
        return reply.code(503).send({
          error: "upstream_circuit_open",
          message: "Временная недоступность upstream, повторите позже",
        });
      }
      req.log.error({ err: e }, "gateway upstream proxy failed");
      return reply.code(502).send({ error: "upstream_unreachable" });
    }
  };

  app.all(prefix, handler);
  app.all(`${prefix}/*`, handler);
}

/**
 * HTTP-прокси на микросервисы с retry и circuit breaker (WebSocket отдельно)
 */
export function registerResilientHttpProxies(app: FastifyInstance): void {
  const auth = env.authServiceUrl;
  const users = env.usersServiceUrl;
  const credits = env.creditsServiceUrl;
  const core = env.coreServiceUrl;
  const adminS = env.adminSettingServiceUrl;
  const clientS = env.clientSettingsServiceUrl;

  registerPrefix(app, "/token", auth, CIRCUIT_GATEWAY_AUTH);
  registerPrefix(app, "/logout", auth, CIRCUIT_GATEWAY_AUTH);
  registerPrefix(app, "/logout-session", auth, CIRCUIT_GATEWAY_AUTH);
  registerPrefix(app, "/jwks", auth, CIRCUIT_GATEWAY_AUTH);

  registerPrefix(app, "/users", users, CIRCUIT_GATEWAY_USERS);
  registerPrefix(app, "/me", users, CIRCUIT_GATEWAY_USERS);

  registerPrefix(app, "/credits", credits, CIRCUIT_GATEWAY_CREDITS);
  registerPrefix(app, "/tariffs", credits, CIRCUIT_GATEWAY_CREDITS);

  registerPrefix(app, "/currencies", core, CIRCUIT_GATEWAY_CORE);
  registerPrefix(app, "/accounts", core, CIRCUIT_GATEWAY_CORE);
  registerPrefix(app, "/dashboard", core, CIRCUIT_GATEWAY_CORE);

  registerPrefix(
    app,
    "/admin-settings",
    adminS,
    CIRCUIT_GATEWAY_ADMIN_SETTINGS,
  );
  registerPrefix(
    app,
    "/client-settings",
    clientS,
    CIRCUIT_GATEWAY_CLIENT_SETTINGS,
  );
}
