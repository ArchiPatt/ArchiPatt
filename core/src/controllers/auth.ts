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
      return { ok: false, code: 401, error: "unauthorized" };
    }

    const profile = await fetchUserProfileByUsername(username);
    if (!profile) return { ok: false, code: 401, error: "unauthorized" };
    if (profile.isBlocked)
      return { ok: false, code: 403, error: "blocked_user" };

    return { ok: true, payload };
  } catch {
    return { ok: false, code: 401, error: "unauthorized" };
  }
}
