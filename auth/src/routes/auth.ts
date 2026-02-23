import { FastifyInstance } from "fastify";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import { IsNull } from "typeorm";
import { env } from "../env";
import { User } from "../db/entities/User";
import { AuthorizationCode } from "../db/entities/AuthorizationCode";
import { RefreshToken } from "../db/entities/RefreshToken";
import { issueAccessToken } from "../security/tokens";
import { getJwks } from "../security/jwks";
import { fetchUserProfileByUsername } from "../integrations/users-service";

type InternalCreateUserBody = {
  username?: string;
};

type LoginQuery = {
  return_to?: string;
  error?: string;
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

type SetupPasswordQuery = {
  token?: string;
};

type SetupPasswordBody = {
  token?: string;
  password?: string;
  passwordRepeat?: string;
};

function oauthError(error: string, description?: string) {
  return {
    error,
    error_description: description,
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

async function issueTokensForProfile(
  app: FastifyInstance,
  username: string,
  profile: { id: string; roles: string[] },
  scopes: string[] = ["profile", "roles"],
) {
  const scopeStr = scopes.join(" ");
  const accessToken = await issueAccessToken({
    sub: profile.id,
    roles: profile.roles,
    scope: scopeStr,
    aud: "bank-app",
  });

  const refreshRepo = app.db.getRepository(RefreshToken);
  const refreshTokenValue = nanoid(48);
  const refreshExpiresAt = new Date(
    Date.now() + env.tokens.refreshTtlSeconds * 1000,
  );

  await refreshRepo.save(
    refreshRepo.create({
      token: refreshTokenValue,
      clientId: "frontend",
      username,
      scopes,
      expiresAt: refreshExpiresAt,
      revokedAt: null,
    }),
  );

  return {
    token_type: "Bearer" as const,
    access_token: accessToken,
    refresh_token: refreshTokenValue,
    expires_in: env.tokens.accessTtlSeconds,
    scope: scopeStr,
  };
}

export function registerAuthRoutes(app: FastifyInstance) {
  app.get("/jwks", async (_req, reply) => {
    const jwks = await getJwks();
    return reply.send(jwks);
  });

  app.get<{ Querystring: LoginQuery }>("/login", async (req, reply) => {
    const returnTo = req.query.return_to ?? "";
    const err = req.query.error ?? "";
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
        ${err ? `<div class="error">${escapeHtml(err)}</div>` : `<div class="muted">После входа сервис перенаправит вас на return_to с code.</div>`}
      </form>
    `,
    );
  });

  app.post<{ Body: LoginBody }>("/login", async (req, reply) => {
    const username = req.body?.username?.trim();
    const password = req.body?.password ?? "";
    const returnTo = req.body?.return_to ?? "";
    const normalizedReturnTo = normalizeReturnTo(returnTo);

    if (!username || !password || !normalizedReturnTo) {
      return reply.redirect(
        `/login?return_to=${encodeURIComponent(returnTo)}&error=${encodeURIComponent("Проверьте логин, пароль и return_to")}`,
      );
    }

    const userRepo = app.db.getRepository(User);
    const user = await userRepo.findOne({ where: { username } });
    if (!user) {
      return reply.redirect(
        `/login?return_to=${encodeURIComponent(returnTo)}&error=${encodeURIComponent("invalid_credentials")}`,
      );
    }

    if (!user.passwordHash) {
      const setupToken = await app.db.getRepository(AuthorizationCode).findOne({
        where: {
          userId: user.id,
          clientId: "password-setup",
          consumedAt: IsNull(),
        },
        order: { createdAt: "DESC" },
      });
      if (setupToken && setupToken.expiresAt.getTime() >= Date.now()) {
        return reply.code(403).send({
          error: "password_setup_required",
          message: "сначала подтвердите пароль",
          setupUrl: `${env.issuer}/setup-password?token=${encodeURIComponent(setupToken.code)}`,
        });
      }
      return reply.code(403).send({
        error: "password_setup_required",
        message: "сначала подтвердите пароль",
      });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return reply.redirect(
        `/login?return_to=${encodeURIComponent(returnTo)}&error=${encodeURIComponent("invalid_credentials")}`,
      );
    }

    const profile = await fetchUserProfileByUsername(user.username);
    if (!profile || profile.isBlocked) {
      return reply.code(403).send({ error: "user_blocked_or_not_found" });
    }

    const codeRepo = app.db.getRepository(AuthorizationCode);
    const code = nanoid(32);
    await codeRepo.save(
      codeRepo.create({
        code,
        clientId: "frontend",
        userId: user.id,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        consumedAt: null,
      }),
    );

    const redirect = new URL(normalizedReturnTo);
    redirect.searchParams.set("code", code);
    return reply.redirect(redirect.toString());
  });

  app.post<{ Body: TokenBody }>("/token", async (req, reply) => {
    const body = req.body as TokenBody;

    if (body.grant_type === "authorization_code") {
      if (!body.code) {
        return reply.code(400).send(oauthError("invalid_request", "code обязателен"));
      }

      const codeRepo = app.db.getRepository(AuthorizationCode);
      const row = await codeRepo.findOne({ where: { code: body.code } });
      if (!row) return reply.code(400).send(oauthError("invalid_grant"));
      if (row.consumedAt) return reply.code(400).send(oauthError("invalid_grant"));
      if (row.expiresAt.getTime() < Date.now()) return reply.code(400).send(oauthError("invalid_grant"));

      row.consumedAt = new Date();
      await codeRepo.save(row);

      const userRepo = app.db.getRepository(User);
      const user = await userRepo.findOne({ where: { id: row.userId } });
      if (!user) return reply.code(400).send(oauthError("invalid_grant"));
      const profile = await fetchUserProfileByUsername(user.username);
      if (!profile || profile.isBlocked) return reply.code(400).send(oauthError("invalid_grant"));

      const tokenPayload = await issueTokensForProfile(app, user.username, {
        id: profile.id,
        roles: profile.roles,
      });
      return reply.send(tokenPayload);
    }

    if (body.grant_type === "refresh_token") {
      if (!body.refresh_token) {
        return reply
          .code(400)
          .send(oauthError("invalid_request", "refresh_token обязателен"));
      }

      const refreshRepo = app.db.getRepository(RefreshToken);
      const row = await refreshRepo.findOne({
        where: { token: body.refresh_token },
      });
      if (!row) return reply.code(400).send(oauthError("invalid_grant"));
      if (row.revokedAt) return reply.code(400).send(oauthError("invalid_grant"));
      if (row.expiresAt.getTime() < Date.now()) return reply.code(400).send(oauthError("invalid_grant"));

      row.revokedAt = new Date();
      await refreshRepo.save(row);

      const userRepo = app.db.getRepository(User);
      const user = await userRepo.findOne({
        where: { username: row.username },
      });
      if (!user) return reply.code(400).send(oauthError("invalid_grant"));
      const profile = await fetchUserProfileByUsername(user.username);
      if (!profile || profile.isBlocked) return reply.code(400).send(oauthError("invalid_grant"));

      const tokenPayload = await issueTokensForProfile(
        app,
        user.username,
        { id: profile.id, roles: profile.roles },
        row.scopes,
      );
      return reply.send(tokenPayload);
    }

    return reply.code(400).send(oauthError("unsupported_grant_type"));
  });

  app.post<{ Body: InternalCreateUserBody }>("/internal/users", async (req, reply) => {
    if (!env.internalToken || req.headers["x-internal-token"] !== env.internalToken) {
      return reply.code(401).send({ error: "unauthorized" });
    }

    const username = req.body?.username?.trim();
    if (!username) {
      return reply.code(400).send({ error: "invalid_input" });
    }

    const userRepo = app.db.getRepository(User);
    const exists = await userRepo.findOne({ where: { username } });
    if (exists) {
      return reply.code(409).send({ error: "username_exists" });
    }

    const user = await userRepo.save(
      userRepo.create({
        username,
        passwordHash: null
      })
    );

    const codeRepo = app.db.getRepository(AuthorizationCode);
    const setupToken = nanoid(48);
    await codeRepo.save(
      codeRepo.create({
        code: setupToken,
        clientId: "password-setup",
        userId: user.id,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
        consumedAt: null
      })
    );

    return reply.code(201).send({
      id: user.id,
      username: user.username,
      setupUrl: `${env.issuer}/setup-password?token=${encodeURIComponent(setupToken)}`
    });
  });

  app.get<{ Querystring: SetupPasswordQuery }>("/setup-password", async (req, reply) => {
    const token = req.query?.token?.trim();
    if (!token) {
      return reply.code(400).type("text/html; charset=utf-8").send(
        htmlPage("Установка пароля", `<h2>Установка пароля</h2><div class="error">Токен обязателен</div>`)
      );
    }

    const row = await app.db.getRepository(AuthorizationCode).findOne({ where: { code: token } });
    if (!row || row.clientId !== "password-setup" || row.consumedAt || row.expiresAt.getTime() < Date.now()) {
      return reply.code(400).type("text/html; charset=utf-8").send(
        htmlPage("Установка пароля", `<h2>Установка пароля</h2><div class="error">Токен недействителен или истёк</div>`)
      );
    }

    return reply.type("text/html; charset=utf-8").send(
      htmlPage(
        "Установка пароля",
        `
        <h2>Установка пароля</h2>
        <form method="post" action="/setup-password">
          <input type="hidden" name="token" value="${escapeHtml(token)}" />
          <label>Новый пароль
            <input name="password" type="password" autocomplete="new-password" />
          </label>
          <label>Повторите пароль
            <input name="passwordRepeat" type="password" autocomplete="new-password" />
          </label>
          <button type="submit">Сохранить пароль</button>
        </form>
      `
      )
    );
  });

  app.post<{ Body: SetupPasswordBody }>("/setup-password", async (req, reply) => {
    const token = req.body?.token?.trim();
    const password = req.body?.password ?? "";
    const passwordRepeat = req.body?.passwordRepeat ?? "";

    if (!token || password.length < 6 || password !== passwordRepeat) {
      return reply.code(400).type("text/html; charset=utf-8").send(
        htmlPage("Установка пароля", `<h2>Установка пароля</h2><div class="error">Проверьте токен и пароль (мин. 6 символов)</div>`)
      );
    }

    const codeRepo = app.db.getRepository(AuthorizationCode);
    const row = await codeRepo.findOne({ where: { code: token } });
    if (!row || row.clientId !== "password-setup" || row.consumedAt || row.expiresAt.getTime() < Date.now()) {
      return reply.code(400).type("text/html; charset=utf-8").send(
        htmlPage("Установка пароля", `<h2>Установка пароля</h2><div class="error">Токен недействителен или истёк</div>`)
      );
    }

    const userRepo = app.db.getRepository(User);
    const user = await userRepo.findOne({ where: { id: row.userId } });
    if (!user) {
      return reply.code(400).type("text/html; charset=utf-8").send(
        htmlPage("Установка пароля", `<h2>Установка пароля</h2><div class="error">Пользователь не найден</div>`)
      );
    }

    user.passwordHash = await bcrypt.hash(password, 10);
    await userRepo.save(user);
    row.consumedAt = new Date();
    await codeRepo.save(row);

    return reply.type("text/html; charset=utf-8").send(
      htmlPage("Установка пароля", `<h2>Готово</h2><div class="muted">Пароль установлен. Теперь можно входить в приложение.</div>`)
    );
  });

  app.post("/logout", async (_req, reply) => {
    return reply.send({ ok: true });
  });
}
