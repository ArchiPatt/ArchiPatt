import { FastifyInstance } from "fastify";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";

import { env } from "../env";
import { User } from "../db/entities/User";
import { Session } from "../db/entities/Session";
import { AuthorizationCode } from "../db/entities/AuthorizationCode";
import { RefreshToken } from "../db/entities/RefreshToken";
import { issueAccessToken } from "../security/tokens";
import { fetchUserProfileByUsername } from "../integrations/users-service";

type LoginQuery = {
  return_to?: string;
};

type LoginBody = {
  username?: string;
  password?: string;
  return_to?: string;
};

type TokenBody =
  | {
      grant_type: "authorization_code";
      code?: string;
    }
  | {
      grant_type: "refresh_token";
      refresh_token?: string;
    };

function oauthError(error: string, description?: string) {
  return {
    error,
    error_description: description
  };
}

function htmlPage(title: string, body: string) {
  return `<!doctype html>
<html lang="ru">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)}</title>
    <style>
      body { background: #fff0f6; color: #831843; font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; max-width: 420px; margin: 40px auto; padding: 0 16px; }
      .card { background: #ffffff; border: 1px solid #f9a8d4; border-radius: 12px; padding: 16px; box-shadow: 0 8px 20px rgba(236, 72, 153, 0.12); }
      label { display:block; margin-top: 12px; font-size: 14px; }
      input { width: 100%; padding: 10px 12px; margin-top: 6px; border-radius: 10px; border: 1px solid #f9a8d4; }
      input:focus { outline: 2px solid #f472b6; border-color: #f472b6; }
      button { margin-top: 16px; width: 100%; padding: 10px 12px; border: 0; border-radius: 10px; background: #ec4899; color: #fff; font-weight: 600; cursor: pointer; }
      button:hover { background: #db2777; }
      .muted { color: #9d174d; font-size: 12px; margin-top: 8px; }
      .error { color: #be123c; font-size: 13px; margin-top: 8px; }
    </style>
  </head>
  <body>
    <div class="card">
      ${body}
    </div>
  </body>
</html>`;
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => {
    switch (c) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      case "'":
        return "&#039;";
      default:
        return c;
    }
  });
}

function normalizeReturnTo(returnTo: string): string | null {
  try {
    const url = new URL(returnTo);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url.toString();
  } catch {
    return null;
  }
}

export function registerAuthRoutes(app: FastifyInstance) {
  // Login page
  app.get<{ Querystring: LoginQuery }>("/login", async (req, reply) => {
    const returnTo = req.query.return_to ?? "";
    const err = typeof req.query.return_to === "string" && req.query.return_to === "error" ? "Ошибка" : null;

    reply.type("text/html; charset=utf-8");
    return htmlPage(
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
        ${
          err
            ? `<div class="error">${escapeHtml(err)}</div>`
            : `<div class="muted">После входа вы будете возвращены на callback URL приложения.</div>`
        }
      </form>
    `
    );
  });

  // Login action
  app.post<{ Body: LoginBody }>("/login", async (req, reply) => {
    const username = req.body?.username?.trim();
    const password = req.body?.password ?? "";
    const returnTo = req.body?.return_to ?? "";
    const normalizedReturnTo = normalizeReturnTo(returnTo);

    if (!username || !password || !normalizedReturnTo) {
      return reply.code(400).type("text/html; charset=utf-8").send(
        htmlPage(
          "Вход",
          `<h2>Вход</h2><div class="error">Проверьте логин, пароль и return_to</div><div class="muted"><a href="/login?return_to=${encodeURIComponent(
            returnTo
          )}">Назад</a></div>`
        )
      );
    }

    const userRepo = app.db.getRepository(User);
    const user = await userRepo.findOne({ where: { username } });
    if (!user) {
      return reply.redirect(`/login?return_to=${encodeURIComponent(returnTo)}`);
    }
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return reply.redirect(`/login?return_to=${encodeURIComponent(returnTo)}`);
    }
    const profile = await fetchUserProfileByUsername(user.username);
    if (!profile || profile.isBlocked) {
      return reply.redirect(`/login?return_to=${encodeURIComponent(returnTo)}`);
    }

    const sessRepo = app.db.getRepository(Session);
    const expiresAt = new Date(Date.now() + env.session.ttlSeconds * 1000);
    const session = sessRepo.create({ userId: user.id, expiresAt });
    const saved = await sessRepo.save(session);

    reply.setCookie(env.session.cookieName, saved.id, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: false
    });

    const codeRepo = app.db.getRepository(AuthorizationCode);
    const code = nanoid(32);
    const authCodeExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await codeRepo.save(
      codeRepo.create({
        code,
        clientId: "frontend",
        userId: user.id,
        redirectUri: normalizedReturnTo,
        scopes: ["openid", "profile", "roles"],
        codeChallenge: "simple-login-flow",
        codeChallengeMethod: "S256",
        nonce: null,
        expiresAt: authCodeExpiresAt,
        consumedAt: null
      })
    );
    const redirect = new URL(normalizedReturnTo);
    redirect.searchParams.set("code", code);
    return reply.redirect(redirect.toString());
  });

  // Token endpoint (simple auth code + refresh)
  app.post<{ Body: TokenBody }>("/token", async (req, reply) => {
    const body = req.body as TokenBody;

    if (body.grant_type === "authorization_code") {
      if (!body.code) {
        return reply.code(400).send(oauthError("invalid_request", "code обязателен"));
      }

      const codeRepo = app.db.getRepository(AuthorizationCode);
      const row = await codeRepo.findOne({ where: { code: body.code } });
      if (!row) return reply.code(400).send(oauthError("invalid_grant", "код не найден"));
      if (row.consumedAt) return reply.code(400).send(oauthError("invalid_grant", "код уже использован"));
      if (row.expiresAt.getTime() < Date.now()) return reply.code(400).send(oauthError("invalid_grant", "код истёк"));

      row.consumedAt = new Date();
      await codeRepo.save(row);

      const userRepo = app.db.getRepository(User);
      const user = await userRepo.findOne({ where: { id: row.userId } });
      if (!user) return reply.code(400).send(oauthError("invalid_grant", "пользователь недоступен"));

      const profile = await fetchUserProfileByUsername(user.username);
      if (!profile || profile.isBlocked) return reply.code(400).send(oauthError("invalid_grant", "пользователь недоступен"));

      const scopeStr = row.scopes.join(" ");
      const accessToken = await issueAccessToken({
        sub: profile.id,
        roles: profile.roles,
        scope: scopeStr,
        aud: "bank-app"
      });

      const refreshRepo = app.db.getRepository(RefreshToken);
      const refreshTokenValue = nanoid(48);
      const refreshExpiresAt = new Date(Date.now() + env.tokens.refreshTtlSeconds * 1000);
      await refreshRepo.save(
        refreshRepo.create({
          token: refreshTokenValue,
          clientId: "frontend",
          username: user.username,
          scopes: row.scopes,
          expiresAt: refreshExpiresAt,
          revokedAt: null
        })
      );

      return reply.send({
        token_type: "Bearer",
        access_token: accessToken,
        expires_in: env.tokens.accessTtlSeconds,
        refresh_token: refreshTokenValue,
        scope: scopeStr
      });
    }

    if (body.grant_type === "refresh_token") {
      if (!body.refresh_token) return reply.code(400).send(oauthError("invalid_request", "refresh_token обязателен"));
      const refreshRepo = app.db.getRepository(RefreshToken);
      const row = await refreshRepo.findOne({ where: { token: body.refresh_token } });
      if (!row) return reply.code(400).send(oauthError("invalid_grant"));
      if (row.revokedAt) return reply.code(400).send(oauthError("invalid_grant"));
      if (row.expiresAt.getTime() < Date.now()) return reply.code(400).send(oauthError("invalid_grant"));

      // Rotate refresh token
      row.revokedAt = new Date();
      await refreshRepo.save(row);

      const userRepo = app.db.getRepository(User);
      const user = await userRepo.findOne({ where: { username: row.username } });
      if (!user) return reply.code(400).send(oauthError("invalid_grant"));
      const profile = await fetchUserProfileByUsername(user.username);
      if (!profile || profile.isBlocked) return reply.code(400).send(oauthError("invalid_grant"));

      const scopeStr = row.scopes.join(" ");
      const accessToken = await issueAccessToken({
        sub: profile.id,
        roles: profile.roles,
        scope: scopeStr,
        aud: "bank-app"
      });

      const newRefresh = nanoid(48);
      await refreshRepo.save(
        refreshRepo.create({
          token: newRefresh,
          clientId: "frontend",
          username: user.username,
          scopes: row.scopes,
          expiresAt: new Date(Date.now() + env.tokens.refreshTtlSeconds * 1000),
          revokedAt: null
        })
      );

      return reply.send({
        token_type: "Bearer",
        access_token: accessToken,
        expires_in: env.tokens.accessTtlSeconds,
        refresh_token: newRefresh,
        scope: scopeStr
      });
    }

    return reply.code(400).send(oauthError("unsupported_grant_type"));
  });

  app.post("/logout", async (req, reply) => {
    const sid = req.cookies[env.session.cookieName];
    if (sid) {
      await app.db.getRepository(Session).delete({ id: sid });
    }
    reply.clearCookie(env.session.cookieName, { path: "/" });
    return reply.send({ ok: true });
  });
}

