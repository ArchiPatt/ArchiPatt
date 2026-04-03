import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { verifyAccessToken } from "../security/bearer";
import { htmlPage, escapeHtml } from "../utils/html";
import { env } from "../env";
import * as authService from "../services/auth";
import { replayOrRun } from "../services/idempotencyReplay";
import { resolveIdempotencyKey } from "../http/idempotencyHeaders";
import {
  internalTokensRevokedController,
  jwksController,
  loginGetController,
  loginPostController,
  tokenController,
  internalUsersController,
  setupPasswordGetController,
  setupPasswordPostController,
  logoutController,
  logoutSessionController,
} from "../controllers/auth";

const LOGIN_IDEM_HIDDEN = `
  <input type="hidden" name="idempotency_key" id="archipatt-login-idem" value="" />
  <script>try{var el=document.getElementById("archipatt-login-idem");if(el)el.value=(self.crypto&&crypto.randomUUID)?crypto.randomUUID():String(Date.now());}catch(e){}</script>`;

const SETUP_IDEM_HIDDEN = `
  <input type="hidden" name="idempotency_key" id="archipatt-sp-idem" value="" />
  <script>try{var el=document.getElementById("archipatt-sp-idem");if(el)el.value=(self.crypto&&crypto.randomUUID)?crypto.randomUUID():String(Date.now());}catch(e){}</script>`;

function renderSetupPasswordPostResult(
  reply: FastifyReply,
  res: { status: number; body: unknown },
) {
  reply.type("text/html; charset=utf-8");
  const body = res.body;
  if (body && typeof body === "object" && body !== null && "error" in body) {
    const err = String((body as { error?: string }).error ?? "");
    return reply
      .code(res.status)
      .send(
        htmlPage(
          "Установка пароля",
          `<h2>Установка пароля</h2><div class="error">${escapeHtml(err)}</div>`,
        ),
      );
  }
  if (body && typeof body === "object" && body !== null && "success" in body) {
    return reply.send(
      htmlPage(
        "Установка пароля",
        `<h2>Готово</h2><div class="muted">Пароль установлен. Теперь можно входить в приложение.</div>`,
      ),
    );
  }
  return reply.code(res.status).send(body);
}

export function createAuthHandlers(app: FastifyInstance) {
  return {
    internalTokensRevoked: async (
      req: FastifyRequest<{ Params: { jti: string } }>,
      reply: FastifyReply,
    ) => {
      const internalOk =
        !!env.internalToken &&
        req.headers["x-internal-token"] === env.internalToken;
      req.log.info(
        {
          jti: req.params.jti,
          internalOk,
          hasXInternalToken: !!req.headers["x-internal-token"],
        },
        "[Auth] GET /internal/tokens/revoked/:jti",
      );
      const res = await internalTokensRevokedController(
        app.db,
        internalOk,
        req.params,
      );
      return reply.code(res.status).send(res.body);
    },

    jwks: async (req: FastifyRequest, reply: FastifyReply) => {
      req.log.info({ issuer: env.issuer }, "[Auth] GET /jwks");
      const res = await jwksController();
      return reply.code(res.status).send(res.body);
    },

    loginGet: async (
      req: FastifyRequest<{
        Querystring: { return_to?: string; error?: string };
      }>,
      reply: FastifyReply,
    ) => {
      const sessionId = req.cookies?.[env.session.cookieName] as
        | string
        | undefined;
      const res = await loginGetController(app, {
        sessionId,
        return_to: req.query.return_to,
        error: req.query.error,
      });

      if (res.status === 302 && "redirect" in res && res.redirect) {
        return reply.redirect(res.redirect);
      }

      const body = res.body as {
        showForm?: boolean;
        returnTo?: string;
        error?: string;
      };
      const returnTo = body?.returnTo ?? "";
      const err = body?.error ?? "";
      reply.type("text/html; charset=utf-8");
      return reply.send(
        htmlPage(
          "Вход",
          `
      <h2>Вход</h2>
      <form method="post" action="/login">
        <input type="hidden" name="return_to" value="${escapeHtml(returnTo)}" />
        ${LOGIN_IDEM_HIDDEN}
        <label>Логин
          <input name="username" autocomplete="username" />
        </label>
        <label>Пароль
          <input name="password" type="password" autocomplete="current-password" />
        </label>
        <button type="submit">Войти</button>
        ${err ? `<div class="error">${escapeHtml(err)}</div>` : `<div class="muted">После входа сервис перенаправит вас на return_to с code.</div>`}
      </form>
    `,
        ),
      );
    },

    loginPost: async (
      req: FastifyRequest<{
        Body: {
          username?: string;
          password?: string;
          return_to?: string;
          idempotency_key?: string;
        };
      }>,
      reply: FastifyReply,
    ) => {
      const key = resolveIdempotencyKey(req);
      const result = await replayOrRun(app.db, key, "auth-login", async () => {
        const r = await loginPostController(app, {
          username: req.body?.username,
          password: req.body?.password,
          return_to: req.body?.return_to,
        });
        if (r.status === 302 && "redirect" in r) {
          return {
            status: 302,
            body: {
              __shape: "redirect",
              redirect: r.redirect,
              sessionId: r.sessionId ?? null,
              sessionMaxAge: r.sessionMaxAge ?? null,
            },
          };
        }
        return {
          status: r.status,
          body: { __shape: "json", data: r.body },
        };
      });

      const b = result.body;
      if (b && typeof b === "object" && b !== null && "__shape" in b) {
        const shaped = b as {
          __shape?: string;
          redirect?: string;
          sessionId?: string | null;
          sessionMaxAge?: number | null;
          data?: unknown;
        };
        if (shaped.__shape === "redirect" && shaped.redirect) {
          if (shaped.sessionId) {
            reply.setCookie(env.session.cookieName, shaped.sessionId, {
              path: "/",
              httpOnly: false,
              secure: env.nodeEnv === "production",
              sameSite: "lax",
              maxAge: shaped.sessionMaxAge ?? env.session.ttlSeconds,
            });
          }
          return reply.redirect(shaped.redirect);
        }
        if (shaped.__shape === "json") {
          return reply.code(result.status).send(shaped.data);
        }
      }
      return reply.code(result.status).send(result.body);
    },

    token: async (
      req: FastifyRequest<{
        Body: {
          grant_type?: string;
          code?: string;
          refresh_token?: string;
        };
      }>,
      reply: FastifyReply,
    ) => {
      const result = await replayOrRun(
        app.db,
        resolveIdempotencyKey(req),
        "oauth-token",
        async () => tokenController(app, req.body ?? {}),
      );
      return reply.code(result.status).send(result.body);
    },

    internalUsers: async (
      req: FastifyRequest<{ Body: { username?: string } }>,
      reply: FastifyReply,
    ) => {
      const internalOk =
        !!env.internalToken &&
        req.headers["x-internal-token"] === env.internalToken;
      const result = await replayOrRun(
        app.db,
        resolveIdempotencyKey(req),
        "internal-create-user",
        async () => internalUsersController(app, internalOk, req.body ?? {}),
      );
      return reply.code(result.status).send(result.body);
    },

    setupPasswordGet: async (
      req: FastifyRequest<{ Querystring: { token?: string } }>,
      reply: FastifyReply,
    ) => {
      const res = await setupPasswordGetController(app, {
        token: req.query?.token,
      });
      reply.type("text/html; charset=utf-8");
      if (res.body && typeof res.body === "object" && "error" in res.body) {
        const err = String((res.body as { error?: string }).error ?? "");
        return reply
          .code(res.status)
          .send(
            htmlPage(
              "Установка пароля",
              `<h2>Установка пароля</h2><div class="error">${escapeHtml(err)}</div>`,
            ),
          );
      }
      if (res.body && typeof res.body === "object" && "token" in res.body) {
        const tok = String((res.body as { token?: string }).token ?? "");
        return reply.send(
          htmlPage(
            "Установка пароля",
            `
        <h2>Установка пароля</h2>
        <form method="post" action="/setup-password">
          <input type="hidden" name="token" value="${escapeHtml(tok)}" />
          ${SETUP_IDEM_HIDDEN}
          <label>Новый пароль
            <input name="password" type="password" autocomplete="new-password" />
          </label>
          <label>Повторите пароль
            <input name="passwordRepeat" type="password" autocomplete="new-password" />
          </label>
          <button type="submit">Сохранить пароль</button>
        </form>
      `,
          ),
        );
      }
      return reply.code(res.status).send(res.body);
    },

    setupPasswordPost: async (
      req: FastifyRequest<{
        Body: {
          token?: string;
          password?: string;
          passwordRepeat?: string;
          idempotency_key?: string;
        };
      }>,
      reply: FastifyReply,
    ) => {
      const result = await replayOrRun(
        app.db,
        resolveIdempotencyKey(req),
        "auth-setup-password",
        async () => setupPasswordPostController(app, req.body ?? {}),
      );
      return renderSetupPasswordPostResult(reply, result);
    },

    logout: async (req: FastifyRequest, reply: FastifyReply) => {
      let payload;
      try {
        payload = await verifyAccessToken(req.headers.authorization);
      } catch {
        return reply.code(401).send({ error: "unauthorized" });
      }
      const sessionId = req.cookies?.[env.session.cookieName] as
        | string
        | undefined;
      const result = await replayOrRun(
        app.db,
        resolveIdempotencyKey(req),
        "auth-logout",
        async () => logoutController(app, payload ?? null),
      );
      if (sessionId) {
        await authService.deleteSessionBySessionId(app.db, sessionId);
      }
      reply.clearCookie(env.session.cookieName, { path: "/" });
      return reply.code(result.status).send(result.body);
    },

    logoutSession: async (
      req: FastifyRequest<{ Querystring: { return_to?: string } }>,
      reply: FastifyReply,
    ) => {
      const sessionId = req.cookies?.[env.session.cookieName] as
        | string
        | undefined;
      const res = await logoutSessionController(
        app,
        sessionId,
        req.query.return_to,
      );
      reply.clearCookie(env.session.cookieName, { path: "/" });
      return reply.redirect(res.redirect);
    },
  };
}
