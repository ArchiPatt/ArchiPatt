import { FastifyRequest } from "fastify";
import { JWTPayload } from "jose";
import { verifyBearerToken } from "../security/jwt";
import { fetchUserProfileByUsername } from "../integrations/users-service";

function hasRole(payload: JWTPayload | null, role: string): boolean {
  const roles = payload?.roles;
  return Array.isArray(roles) && roles.includes(role);
}

export function isEmployee(payload: JWTPayload): boolean {
  return hasRole(payload, "employee") || hasRole(payload, "admin");
}

export type RequireAuthFail = { ok: false; code: number };
export type RequireAuthOk = { ok: true; payload: JWTPayload };

export function requireAuth(
  payload: JWTPayload | null,
): RequireAuthFail | RequireAuthOk {
  if (!payload) return { ok: false, code: 401 };
  return { ok: true, payload };
}

export type ActiveAuthFail = { ok: false; code: number; error: string };
export type ActiveAuthOk = { ok: true; payload: JWTPayload };

export async function requireActiveAuth(
  payload: JWTPayload | null,
): Promise<ActiveAuthFail | ActiveAuthOk> {
  const a = requireAuth(payload);
  if (!a.ok) return { ok: false, code: a.code, error: "unauthorized" };
  const username =
    typeof a.payload.username === "string" ? a.payload.username : null;
  if (!a.payload.sub || !username) {
    return {
      ok: false,
      code: 401,
      error: "unauthorized",
    };
  }

  try {
    const profile = await fetchUserProfileByUsername(username);
    if (!profile)
      return {
        ok: false,
        code: 401,
        error: "unauthorized",
      };
    if (profile.isBlocked)
      return {
        ok: false,
        code: 403,
        error: "blocked_user",
      };
  } catch {
    return {
      ok: false,
      code: 401,
      error: "unauthorized",
    };
  }

  return { ok: true, payload: a.payload };
}

export async function safeVerify(req: FastifyRequest) {
  try {
    const auth = (req.headers.authorization ?? req.headers.Authorization) as
      | string
      | undefined;
    return await verifyBearerToken(auth);
  } catch (err) {
    req.log.warn(
      {
        err: String(err),
        hasAuth: !!(req.headers.authorization ?? req.headers.Authorization),
        url: req.url,
      },
      "[Credits] token verify failed",
    );
    return null;
  }
}
