import { FastifyInstance } from "fastify";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import { env } from "../env";
import { issueAccessToken } from "../security/tokens";
import { getJwks } from "../security/jwks";
import { fetchUserProfileByUsername } from "../integrations/users-service";
import * as authService from "../services/auth";

function oauthError(error: string, description?: string) {
  return { error, error_description: description };
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
    username,
    roles: profile.roles,
    scope: scopeStr,
    aud: "bank-app",
  });

  const refreshTokenValue = nanoid(48);
  await authService.createRefreshToken(app.db, {
    token: refreshTokenValue,
    clientId: "frontend",
    username,
    scopes,
    expiresAt: new Date(
      Date.now() + env.tokens.refreshTtlSeconds * 1000,
    ),
  });

  return {
    token_type: "Bearer" as const,
    access_token: accessToken,
    refresh_token: refreshTokenValue,
    expires_in: env.tokens.accessTtlSeconds,
    scope: scopeStr,
  };
}

export async function internalTokensRevokedController(
  ds: Parameters<typeof authService.findRevokedTokenByJti>[0],
  internalOk: boolean,
  params: { jti: string },
) {
  if (!internalOk)
    return { status: 401 as const, body: { error: "unauthorized" } };
  const jti = params.jti?.trim();
  if (!jti) return { status: 400 as const, body: { error: "invalid_jti" } };

  const revoked = await authService.findRevokedTokenByJti(ds, jti);
  return { status: 200 as const, body: { revoked: Boolean(revoked) } };
}

export async function jwksController() {
  const jwks = await getJwks();
  return { status: 200 as const, body: jwks };
}

export async function loginPostController(
  app: FastifyInstance,
  params: {
    username?: string;
    password?: string;
    return_to?: string;
  },
) {
  const username = params.username?.trim();
  const password = params.password ?? "";
  const returnTo = params.return_to ?? "";
  const normalizedReturnTo = normalizeReturnTo(returnTo);

  if (!username || !password || !normalizedReturnTo) {
    return {
      status: 302 as const,
      redirect: `/login?return_to=${encodeURIComponent(returnTo)}&error=${encodeURIComponent("Проверьте логин, пароль и return_to")}`,
    };
  }

  const user = await authService.findUserByUsername(app.db, username);
  if (!user) {
    return {
      status: 302 as const,
      redirect: `/login?return_to=${encodeURIComponent(returnTo)}&error=${encodeURIComponent("invalid_credentials")}`,
    };
  }

  if (!user.passwordHash) {
    const setupToken = await authService.findSetupTokenForUser(app.db, user.id);
    if (setupToken && setupToken.expiresAt.getTime() >= Date.now()) {
      return {
        status: 403 as const,
        body: {
          error: "password_setup_required",
          message: "сначала подтвердите пароль",
          setupUrl: `${env.issuer}/setup-password?token=${encodeURIComponent(setupToken.code)}`,
        },
      };
    }
    return {
      status: 403 as const,
      body: { error: "password_setup_required", message: "сначала подтвердите пароль" },
    };
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    return {
      status: 302 as const,
      redirect: `/login?return_to=${encodeURIComponent(returnTo)}&error=${encodeURIComponent("invalid_credentials")}`,
    };
  }

  const profile = await fetchUserProfileByUsername(user.username);
  if (!profile || profile.isBlocked) {
    return { status: 403 as const, body: { error: "user_blocked_or_not_found" } };
  }

  const code = nanoid(32);
  await authService.createAuthCode(app.db, {
    code,
    clientId: "frontend",
    userId: user.id,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
  });

  const redirect = new URL(normalizedReturnTo);
  redirect.searchParams.set("code", code);
  return { status: 302 as const, redirect: redirect.toString() };
}

export async function tokenController(
  app: FastifyInstance,
  params: {
    grant_type?: string;
    code?: string;
    refresh_token?: string;
  },
) {
  const body = params;

  if (body.grant_type === "authorization_code") {
    if (!body.code) {
      return {
        status: 400 as const,
        body: oauthError("invalid_request", "code обязателен"),
      };
    }

    const row = await authService.findAuthCodeByCode(app.db, body.code);
    if (!row)
      return { status: 400 as const, body: oauthError("invalid_grant") };
    if (row.consumedAt)
      return { status: 400 as const, body: oauthError("invalid_grant") };
    if (row.expiresAt.getTime() < Date.now())
      return { status: 400 as const, body: oauthError("invalid_grant") };

    await authService.consumeAuthCode(app.db, row);

    const user = await authService.findUserById(app.db, row.userId);
    if (!user)
      return { status: 400 as const, body: oauthError("invalid_grant") };
    const profile = await fetchUserProfileByUsername(user.username);
    if (!profile || profile.isBlocked)
      return { status: 400 as const, body: oauthError("invalid_grant") };

    const tokenPayload = await issueTokensForProfile(app, user.username, {
      id: profile.id,
      roles: profile.roles,
    });
    return { status: 200 as const, body: tokenPayload };
  }

  if (body.grant_type === "refresh_token") {
    if (!body.refresh_token) {
      return {
        status: 400 as const,
        body: oauthError("invalid_request", "refresh_token обязателен"),
      };
    }

    const row = await authService.findRefreshToken(app.db, body.refresh_token);
    if (!row)
      return { status: 400 as const, body: oauthError("invalid_grant") };
    if (row.revokedAt)
      return { status: 400 as const, body: oauthError("invalid_grant") };
    if (row.expiresAt.getTime() < Date.now())
      return { status: 400 as const, body: oauthError("invalid_grant") };

    await authService.revokeRefreshToken(app.db, row);

    const user = await authService.findUserByUsername(app.db, row.username);
    if (!user)
      return { status: 400 as const, body: oauthError("invalid_grant") };
    const profile = await fetchUserProfileByUsername(user.username);
    if (!profile || profile.isBlocked)
      return { status: 400 as const, body: oauthError("invalid_grant") };

    const tokenPayload = await issueTokensForProfile(
      app,
      user.username,
      { id: profile.id, roles: profile.roles },
      row.scopes,
    );
    return { status: 200 as const, body: tokenPayload };
  }

  return { status: 400 as const, body: oauthError("unsupported_grant_type") };
}

export async function internalUsersController(
  app: FastifyInstance,
  internalOk: boolean,
  params: { username?: string },
) {
  if (!internalOk)
    return { status: 401 as const, body: { error: "unauthorized" } };

  const username = params.username?.trim();
  if (!username) {
    return { status: 400 as const, body: { error: "invalid_input" } };
  }

  const exists = await authService.findUserByUsername(app.db, username);
  if (exists) {
    return { status: 409 as const, body: { error: "username_exists" } };
  }

  const user = await authService.createUser(app.db, username);

  const setupToken = nanoid(48);
  await authService.createAuthCode(app.db, {
    code: setupToken,
    clientId: "password-setup",
    userId: user.id,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
  });

  return {
    status: 201 as const,
    body: {
      id: user.id,
      username: user.username,
      setupUrl: `${env.issuer}/setup-password?token=${encodeURIComponent(setupToken)}`,
    },
  };
}

export async function setupPasswordGetController(
  app: FastifyInstance,
  params: { token?: string },
) {
  const token = params.token?.trim();
  if (!token) {
    return {
      status: 400 as const,
      body: { type: "html" as const, error: "Токен обязателен" },
    };
  }

  const row = await authService.findAuthCodeByCode(app.db, token);
  if (
    !row ||
    row.clientId !== "password-setup" ||
    row.consumedAt ||
    row.expiresAt.getTime() < Date.now()
  ) {
    return {
      status: 400 as const,
      body: { type: "html" as const, error: "Токен недействителен или истёк" },
    };
  }

  return { status: 200 as const, body: { type: "html" as const, token } };
}

export async function setupPasswordPostController(
  app: FastifyInstance,
  params: {
    token?: string;
    password?: string;
    passwordRepeat?: string;
  },
) {
  const token = params.token?.trim();
  const password = params.password ?? "";
  const passwordRepeat = params.passwordRepeat ?? "";

  if (!token || password.length < 6 || password !== passwordRepeat) {
    return {
      status: 400 as const,
      body: {
        type: "html" as const,
        error: "Проверьте токен и пароль (мин. 6 символов)",
      },
    };
  }

  const row = await authService.findAuthCodeByCode(app.db, token);
  if (
    !row ||
    row.clientId !== "password-setup" ||
    row.consumedAt ||
    row.expiresAt.getTime() < Date.now()
  ) {
    return {
      status: 400 as const,
      body: {
        type: "html" as const,
        error: "Токен недействителен или истёк",
      },
    };
  }

  const user = await authService.findUserById(app.db, row.userId);
  if (!user) {
    return {
      status: 400 as const,
      body: {
        type: "html" as const,
        error: "Пользователь не найден",
      },
    };
  }

  const hash = await bcrypt.hash(password, 10);
  await authService.setPasswordHash(app.db, user.id, hash);
  await authService.consumeAuthCode(app.db, row);

  return {
    status: 200 as const,
    body: { type: "html" as const, success: true },
  };
}

export async function logoutController(
  app: FastifyInstance,
  payload: { jti?: string; exp?: number } | null,
) {
  if (!payload) return { status: 401 as const, body: { error: "unauthorized" } };

  const jti = typeof payload.jti === "string" ? payload.jti : null;
  const exp = typeof payload.exp === "number" ? payload.exp : null;
  if (!jti || !exp) {
    return { status: 400 as const, body: { error: "token_without_jti_or_exp" } };
  }

  const exists = await authService.findRevokedTokenByJti(app.db, jti);
  if (!exists) {
    await authService.createRevokedToken(app.db, jti, new Date(exp * 1000));
  }
  return { status: 200 as const, body: { ok: true } };
}
