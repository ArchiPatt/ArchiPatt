import Fastify, {
  FastifyInstance,
  FastifyRequest,
  RawServerBase,
  RequestGenericInterface,
} from "fastify";
import type { IncomingHttpHeaders, IncomingMessage } from "http";
import type { Http2ServerRequest } from "http2";
import { randomUUID } from "node:crypto";
import proxy from "@fastify/http-proxy";
import cors from "@fastify/cors";
import path from "path";
import { readFile } from "fs/promises";
import { env } from "./env";

declare module "fastify" {
  interface FastifyRequest {
    traceId: string;
    traceStartMs: number;
  }
}

function mergeTraceHeader(
  req: Pick<FastifyRequest, "traceId">,
  headers: IncomingHttpHeaders,
): IncomingHttpHeaders {
  return req.traceId ? { ...headers, "x-trace-id": req.traceId } : headers;
}

function reportGatewaySpan(payload: {
  traceId: string;
  method: string;
  path: string;
  statusCode: number;
  durationMs: number;
  error: boolean;
}): void {
  const base = env.monitoringServiceUrl;
  if (!base) return;
  const url = `${base.replace(/\/$/, "")}/internal/ingest`;
  const body = JSON.stringify({
    ...payload,
    source: "gateway",
    at: Date.now(),
  });
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), 2000);
  void fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    signal: ac.signal,
  })
    .catch(() => undefined)
    .finally(() => clearTimeout(t));
}

function authRedirectUrl(path: string, queryString: string) {
  const qs = queryString ? `?${queryString}` : "";
  return `${env.authServiceUrl}${path}${qs}`;
}

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: {
      level: env.nodeEnv === "development" ? "info" : "info",
    },
  });

  app.addHook("onRequest", async (req, reply) => {
    const incoming = req.headers["x-trace-id"] ?? req.headers["x-request-id"];
    const traceId =
      typeof incoming === "string" && incoming.length > 0
        ? incoming
        : randomUUID();
    req.traceId = traceId;
    req.traceStartMs = Date.now();
    reply.header("x-trace-id", traceId);
  });

  app.addHook("onResponse", async (req, reply) => {
    const path = (req.raw.url ?? "").split("?")[0] ?? "";
    if (
      path === "/health" ||
      path.startsWith("/debug") ||
      path === "/swagger" ||
      path === "/swagger.yml"
    ) {
      return;
    }
    const durationMs = Date.now() - req.traceStartMs;
    const statusCode = reply.statusCode;
    const error = statusCode >= 500;
    reportGatewaySpan({
      traceId: req.traceId,
      method: req.method,
      path,
      statusCode,
      durationMs,
      error,
    });
  });

  await app.register(cors, {
    origin: true,
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  });

  app.get("/health", async () => ({ ok: true }));

  // Диагностика: проверка передачи Authorization (только для отладки)
  app.get("/debug/headers", async (req) => ({
    hasAuthorization: !!(
      req.headers.authorization ?? req.headers.Authorization
    ),
    authPrefix: (
      req.headers.authorization ??
      req.headers.Authorization ??
      ""
    ).slice(0, 20),
  }));

  app.get("/swagger.yml", async (_req, reply) => {
    const filePath = path.join(
      __dirname,
      "..",
      "openapi",
      "gateway.openapi.yml",
    );
    const yml = await readFile(filePath, "utf-8");
    reply.type("application/yaml; charset=utf-8");
    return yml;
  });

  app.get("/swagger", async (_req, reply) => {
    reply.type("text/html; charset=utf-8");
    return `<!doctype html>
<html lang="ru">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Gateway Swagger</title>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
    <style>
      body { margin: 0; background: #fff0f6; }
      #swagger-ui { max-width: 1280px; margin: 0 auto; }
      .swagger-ui .topbar { display: none; }
    </style>
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-standalone-preset.js"></script>
    <script>
      SwaggerUIBundle({
        url: "/swagger.yml",
        dom_id: "#swagger-ui",
        presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
        layout: "BaseLayout"
      });
    </script>
  </body>
</html>`;
  });

  // Пароль вводится только на auth-страницах, поэтому тут только redirect.
  app.get("/login", async (req, reply) => {
    return reply.redirect(
      authRedirectUrl("/login", req.raw.url?.split("?")[1] ?? ""),
    );
  });
  app.get("/setup-password", async (req, reply) => {
    return reply.redirect(
      authRedirectUrl("/setup-password", req.raw.url?.split("?")[1] ?? ""),
    );
  });

  app.post("/login", async (_req, reply) => {
    return reply.code(400).send({
      error: "login_via_auth_only",
      message: "Введите пароль только на странице auth (/login)",
    });
  });
  app.post("/setup-password", async (_req, reply) => {
    return reply.code(400).send({
      error: "password_setup_via_auth_only",
      message: "Установите пароль только на странице auth (/setup-password)",
    });
  });

  const authProxyOptions = {
    upstream: env.authServiceUrl,
    replyOptions: {
      rewriteRequestHeaders(
        req: FastifyRequest<
          RequestGenericInterface,
          RawServerBase,
          IncomingMessage | Http2ServerRequest
        >,
        headers: IncomingHttpHeaders,
      ): IncomingHttpHeaders {
        const cookie = req.headers.cookie;
        const withCookie = cookie ? { ...headers, cookie } : headers;
        return mergeTraceHeader(req, withCookie);
      },
    },
  };

  await app.register(proxy, {
    ...authProxyOptions,
    prefix: "/token",
    rewritePrefix: "/token",
  });
  await app.register(proxy, {
    ...authProxyOptions,
    prefix: "/logout",
    rewritePrefix: "/logout",
  });
  await app.register(proxy, {
    ...authProxyOptions,
    prefix: "/logout-session",
    rewritePrefix: "/logout-session",
  });
  await app.register(proxy, {
    upstream: env.authServiceUrl,
    prefix: "/jwks",
    rewritePrefix: "/jwks",
    replyOptions: {
      rewriteRequestHeaders(
        req: FastifyRequest<
          RequestGenericInterface,
          RawServerBase,
          IncomingMessage | Http2ServerRequest
        >,
        headers: IncomingHttpHeaders,
      ): IncomingHttpHeaders {
        return mergeTraceHeader(req, headers);
      },
    },
  });

  const proxyWithAuth = (upstream: string, prefix: string) =>
    app.register(proxy, {
      upstream,
      prefix,
      rewritePrefix: prefix,
      replyOptions: {
        rewriteRequestHeaders(
          req: FastifyRequest<
            RequestGenericInterface,
            RawServerBase,
            IncomingMessage | Http2ServerRequest
          >,
          headers: IncomingHttpHeaders,
        ): IncomingHttpHeaders {
          const h = req.headers;
          const raw = h.authorization ?? h.Authorization;
          const auth = Array.isArray(raw) ? raw[0] : raw;
          const withAuth = auth
            ? { ...headers, authorization: auth }
            : headers;
          return mergeTraceHeader(req, withAuth);
        },
      },
    });

  await proxyWithAuth(env.usersServiceUrl, "/users");
  await proxyWithAuth(env.usersServiceUrl, "/me");

  await proxyWithAuth(env.creditsServiceUrl, "/credits");
  await proxyWithAuth(env.creditsServiceUrl, "/tariffs");

  await proxyWithAuth(env.coreServiceUrl, "/currencies");
  await proxyWithAuth(env.coreServiceUrl, "/accounts");
  await proxyWithAuth(env.coreServiceUrl, "/dashboard");

  await app.register(proxy, {
    upstream: env.coreServiceUrl,
    prefix: "/ws",
    rewritePrefix: "/ws",
    websocket: true,
    replyOptions: {
      rewriteRequestHeaders(
        req: FastifyRequest<
          RequestGenericInterface,
          RawServerBase,
          IncomingMessage | Http2ServerRequest
        >,
        headers: IncomingHttpHeaders,
      ): IncomingHttpHeaders {
        return mergeTraceHeader(req, headers);
      },
    },
  });

  await proxyWithAuth(env.adminSettingServiceUrl, "/admin-settings");
  await proxyWithAuth(env.clientSettingsServiceUrl, "/client-settings");

  return app;
}
