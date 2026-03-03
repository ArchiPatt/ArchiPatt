import { JWTPayload } from "jose";
import { verifyBearerToken } from "../security/jwt";
import { fetchUserProfileByUsername } from "../integrations/users-service";

export async function authPayloadOrNull(req: {
  headers: { authorization?: string };
}): Promise<
  | { ok: true; payload: JWTPayload }
  | { ok: false; code: 401 | 403; error: string }
> {
  try {
    const payload = await verifyBearerToken(req.headers.authorization);
    const username =
      typeof payload?.username === "string" ? payload.username : null;
    if (!payload?.sub || !username) {
      return { ok: false as const, code: 401 as const, error: "unauthorized" };
    }

    const profile = await fetchUserProfileByUsername(username);
    if (!profile)
      return { ok: false as const, code: 401 as const, error: "unauthorized" };
    if (profile.isBlocked)
      return { ok: false as const, code: 403 as const, error: "blocked_user" };

    return { ok: true as const, payload };
  } catch {
    return { ok: false as const, code: 401 as const, error: "unauthorized" };
  }
}
