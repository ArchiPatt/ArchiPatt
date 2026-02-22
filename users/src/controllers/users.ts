import { DataSource } from "typeorm";
import { JWTPayload } from "jose";
import { requireAuth, canManage } from "./auth";
import { createUser, deleteById, findById, findByUsername, listUsers, setBlocked } from "../services/profiles";
import { createAuthCredentials } from "../integrations/auth-service";

function normalizeRoles(roles?: string[]): string[] {
  if (!Array.isArray(roles)) return [];
  return [...new Set(roles.map((r) => r.trim()).filter(Boolean))];
}

export async function internalByUsernameController(
  ds: DataSource,
  internalOk: boolean,
  params: { username: string }
) {
  if (!internalOk) return { status: 401 as const, body: { error: "unauthorized" } };
  const username = params.username.trim();
  if (!username) return { status: 400 as const, body: { error: "username_required" } };

  const user = await findByUsername(ds, username);
  if (!user) return { status: 404 as const, body: { error: "not_found" } };

  return {
    status: 200 as const,
    body: { id: user.id, username: user.username, roles: user.roles, isBlocked: user.isBlocked }
  };
}

export async function meController(ds: DataSource, payload: JWTPayload | null) {
  const a = requireAuth(payload);
  if (!a.ok) return { status: a.code, body: { error: "unauthorized" } };
  if (!a.payload.sub) return { status: 401 as const, body: { error: "unauthorized" } };

  const user = await findById(ds, String(a.payload.sub));
  if (!user) return { status: 404 as const, body: { error: "not_found" } };

  return {
    status: 200 as const,
    body: {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      roles: user.roles,
      isBlocked: user.isBlocked
    }
  };
}

export async function listController(ds: DataSource, payload: JWTPayload | null) {
  const a = requireAuth(payload);
  if (!a.ok) return { status: a.code, body: { error: "unauthorized" } };
  if (!canManage(a.payload)) return { status: 403 as const, body: { error: "forbidden" } };

  const rows = await listUsers(ds);
  return {
    status: 200 as const,
    body: rows.map((u) => ({
      id: u.id,
      username: u.username,
      displayName: u.displayName,
      roles: u.roles,
      isBlocked: u.isBlocked,
      createdAt: u.createdAt
    }))
  };
}

export async function getController(ds: DataSource, payload: JWTPayload | null, params: { id: string }) {
  const a = requireAuth(payload);
  if (!a.ok) return { status: a.code, body: { error: "unauthorized" } };
  if (!canManage(a.payload)) return { status: 403 as const, body: { error: "forbidden" } };

  const user = await findById(ds, params.id);
  if (!user) return { status: 404 as const, body: { error: "not_found" } };

  return {
    status: 200 as const,
    body: {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      roles: user.roles,
      isBlocked: user.isBlocked
    }
  };
}

export async function createController(
  ds: DataSource,
  payload: JWTPayload | null,
  body: { username?: string; displayName?: string; roles?: string[] }
) {
  const a = requireAuth(payload);
  if (!a.ok) return { status: a.code, body: { error: "unauthorized" } };
  if (!canManage(a.payload)) return { status: 403 as const, body: { error: "forbidden" } };

  const username = body.username?.trim();
  if (!username) return { status: 400 as const, body: { error: "username_required" } };

  const roles = normalizeRoles(body.roles);
  if (!roles.length) return { status: 400 as const, body: { error: "roles_required" } };

  const res = await createUser(ds, { username, displayName: body.displayName?.trim() || null, roles });
  if (res.kind === "conflict") return { status: 409 as const, body: { error: "username_exists" } };

  let setupUrl: string | null = null;
  try {
    const authRes = await createAuthCredentials({ username });
    if (authRes.kind === "conflict") {
      await deleteById(ds, res.user.id);
      return { status: 409 as const, body: { error: "username_exists_in_auth" } };
    }
    setupUrl = authRes.setupUrl;
  } catch {
    await deleteById(ds, res.user.id);
    return { status: 502 as const, body: { error: "auth_service_unavailable" } };
  }

  return {
    status: 201 as const,
    body: {
      id: res.user.id,
      username: res.user.username,
      displayName: res.user.displayName,
      roles: res.user.roles,
      isBlocked: res.user.isBlocked,
      setupUrl
    }
  };
}

export async function blockController(
  ds: DataSource,
  payload: JWTPayload | null,
  params: { id: string },
  body: { isBlocked?: boolean }
) {
  const a = requireAuth(payload);
  if (!a.ok) return { status: a.code, body: { error: "unauthorized" } };
  if (!canManage(a.payload)) return { status: 403 as const, body: { error: "forbidden" } };

  if (typeof body.isBlocked !== "boolean") {
    return { status: 400 as const, body: { error: "isBlocked_boolean_required" } };
  }

  const res = await setBlocked(ds, params.id, body.isBlocked);
  if (res.kind === "not_found") return { status: 404 as const, body: { error: "not_found" } };

  return {
    status: 200 as const,
    body: { id: res.user.id, username: res.user.username, isBlocked: res.user.isBlocked }
  };
}

