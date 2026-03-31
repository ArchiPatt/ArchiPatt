import { env } from "../env";
import { traceHeaders } from "../trace/traceContext";

type ExternalUserProfile = {
  id: string;
  username: string;
  roles: string[];
  isBlocked: boolean;
};

export async function fetchUserProfileByUsername(
  username: string,
): Promise<ExternalUserProfile | null> {
  const url = `${env.usersService.baseUrl}/internal/users/by-username/${encodeURIComponent(username)}`;
  const res = await fetch(url, {
    method: "GET",
    headers: {
      "x-internal-token": env.usersService.internalToken,
      ...traceHeaders(),
    },
  });

  if (res.status === 404) return null;
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`users service error (${res.status}): ${text}`);
  }

  return (await res.json()) as ExternalUserProfile;
}
