import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { verifyAccessToken } from "../security/bearer";
import { htmlPage, escapeHtml } from "../utils/html";
import { env } from "../env";
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
        "[Auth] GET /internal/tokens/revoked/:jti"
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
      req: FastifyRequest<{ Querystring: { return_to?: string; error?: string } }>,
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

      if (res.status === 302 && "redirect" in res) {
        return reply.redirect(res.redirect);
      }

      const body = res.body as { showForm?: boolean; returnTo?: string; error?: string };
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
        Body: { username?: string; password?: string; return_to?: string };
      }>,
      reply: FastifyReply,
    ) => {
      const res = await loginPostController(app, {
        username: req.body?.username,
        password: req.body?.password,
        return_to: req.body?.return_to,
      });
      if (res.status === 302 && "redirect" in res) {
        if ("sessionId" in res && res.sessionId) {
          reply.setCookie(env.session.cookieName, res.sessionId, {
            path: "/",
            httpOnly: true,
            secure: env.nodeEnv === "production",
            sameSite: "lax",
            maxAge: res.sessionMaxAge ?? env.session.ttlSeconds,
          });
        }
        return reply.redirect(res.redirect);
      }
      return reply.code(res.status).send(res.body);
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
      const res = await tokenController(app, req.body ?? {});
      return reply.code(res.status).send(res.body);
    },

    internalUsers: async (
      req: FastifyRequest<{ Body: { username?: string } }>,
      reply: FastifyReply,
    ) => {
      const internalOk =
        !!env.internalToken &&
        req.headers["x-internal-token"] === env.internalToken;
      const res = await internalUsersController(app, internalOk, req.body ?? {});
      return reply.code(res.status).send(res.body);
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
        Body: { token?: string; password?: string; passwordRepeat?: string };
      }>,
      reply: FastifyReply,
    ) => {
      const res = await setupPasswordPostController(app, req.body ?? {});
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
      if (res.body && typeof res.body === "object" && "success" in res.body) {
        return reply.send(
          htmlPage(
            "Установка пароля",
            `<h2>Готово</h2><div class="muted">Пароль установлен. Теперь можно входить в приложение.</div>`,
          ),
        );
      }
      return reply.code(res.status).send(res.body);
    },

    logout: async (req: FastifyRequest, reply: FastifyReply) => {
      let payload;
      try {
        payload = await verifyAccessToken(req.headers.authorization);
      } catch {
        return reply.code(401).send({ error: "unauthorized" });
      }
      const res = await logoutController(app, payload ?? null);
      return reply.code(res.status).send(res.body);
    },

    logoutSession: async (
      req: FastifyRequest<{ Querystring: { return_to?: string } }>,
      reply: FastifyReply,
    ) => {
      const sessionId = req.cookies?.[env.session.cookieName] as
        | string
        | undefined;
      const res = await logoutSessionController(app, sessionId, req.query.return_to);
      reply.clearCookie(env.session.cookieName, { path: "/" });
      return reply.redirect(res.redirect);
    },
  };
}
