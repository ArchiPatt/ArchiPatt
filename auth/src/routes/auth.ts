import { FastifyInstance } from "fastify";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import { env } from "../env";
import { User } from "../db/entities/User";
import { AuthorizationCode } from "../db/entities/AuthorizationCode";

type InternalCreateUserBody = {
  username?: string;
};

type SetupPasswordQuery = {
  token?: string;
};

type SetupPasswordBody = {
  token?: string;
  password?: string;
  passwordRepeat?: string;
};

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

export function registerAuthRoutes(app: FastifyInstance) {
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
