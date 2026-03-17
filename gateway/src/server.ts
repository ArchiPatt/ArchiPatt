import Fastify, { FastifyInstance } from "fastify";
import proxy from "@fastify/http-proxy";
import cors from "@fastify/cors";
import path from "path";
import { readFile } from "fs/promises";
import { env } from "./env";

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
    authPrefix: (req.headers.authorization ?? req.headers.Authorization ?? "")
      .slice(0, 20),
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

  await app.register(proxy, {
    upstream: env.authServiceUrl,
    prefix: "/token",
    rewritePrefix: "/token",
  });
  await app.register(proxy, {
    upstream: env.authServiceUrl,
    prefix: "/logout",
    rewritePrefix: "/logout",
  });
  await app.register(proxy, {
    upstream: env.authServiceUrl,
    prefix: "/jwks",
    rewritePrefix: "/jwks",
  });

  const proxyWithAuth = (upstream: string, prefix: string) =>
    app.register(proxy, {
      upstream,
      prefix,
      rewritePrefix: prefix,
      replyOptions: {
        rewriteRequestHeaders(
          req: { headers: Record<string, string | undefined> },
          headers: Record<string, string>,
        ) {
          const auth = req.headers.authorization ?? req.headers.Authorization;
          return auth ? { ...headers, authorization: auth } : headers;
        },
      },
    });

  await proxyWithAuth(env.usersServiceUrl, "/users");
  await proxyWithAuth(env.usersServiceUrl, "/me");

  await proxyWithAuth(env.creditsServiceUrl, "/credits");
  await proxyWithAuth(env.creditsServiceUrl, "/tariffs");

  await proxyWithAuth(env.coreServiceUrl, "/accounts");
  await proxyWithAuth(env.coreServiceUrl, "/dashboard");

  await app.register(proxy, {
    upstream: env.coreServiceUrl,
    prefix: "/ws",
    rewritePrefix: "/ws",
    websocket: true,
  });

  await proxyWithAuth(env.adminSettingServiceUrl, "/admin-settings");

  return app;
}
