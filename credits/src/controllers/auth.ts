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

export function requireAuth(payload: JWTPayload | null) {
  if (!payload) return { ok: false as const, code: 401 as const };
  return { ok: true as const, payload };
}

export async function requireActiveAuth(payload: JWTPayload | null) {
  const a = requireAuth(payload);
  if (!a.ok)
    return { ok: false as const, code: a.code, error: "unauthorized" as const };
  const username =
    typeof a.payload.username === "string" ? a.payload.username : null;
  if (!a.payload.sub || !username) {
    return {
      ok: false as const,
      code: 401 as const,
      error: "unauthorized" as const,
    };
  }

  try {
    const profile = await fetchUserProfileByUsername(username);
    if (!profile)
      return {
        ok: false as const,
        code: 401 as const,
        error: "unauthorized" as const,
      };
    if (profile.isBlocked)
      return {
        ok: false as const,
        code: 403 as const,
        error: "blocked_user" as const,
      };
  } catch {
    return {
      ok: false as const,
      code: 401 as const,
      error: "unauthorized" as const,
    };
  }

  return { ok: true as const, payload: a.payload };
}

export async function safeVerify(req: FastifyRequest) {
  try {
    return await verifyBearerToken(req.headers.authorization);
  } catch {
    return null;
  }
}
