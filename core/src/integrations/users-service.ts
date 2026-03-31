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
  authorization?: string,
): Promise<ExternalUserProfile | null> {
  const url = `${env.usersService.baseUrl}/internal/users/by-username/${encodeURIComponent(username)}`;
  const headers: Record<string, string> = {
    "x-internal-token": env.usersService.internalToken,
    ...traceHeaders(),
  };
  if (authorization) headers["authorization"] = authorization;
  const res = await fetch(url, {
    method: "GET",
    headers,
  });

  if (res.status === 404) return null;
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`users service error (${res.status}): ${text}`);
  }

  return (await res.json()) as ExternalUserProfile;
}

export type ExternalUserListItem = {
  id: string;
  username: string;
  displayName: string | null;
  roles: string[];
  isBlocked: boolean;
};

export async function fetchUsersInternal(
  limit: number,
  offset: number,
  authorization?: string,
): Promise<{
  items: ExternalUserListItem[];
  total: number;
}> {
  const url = `${env.usersService.baseUrl}/internal/users?limit=${limit}&offset=${offset}`;
  const headers: Record<string, string> = {
    "x-internal-token": env.usersService.internalToken,
    ...traceHeaders(),
  };
  if (authorization) headers["authorization"] = authorization;
  const res = await fetch(url, {
    method: "GET",
    headers,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`users service error (${res.status}): ${text}`);
  }

  return (await res.json()) as { items: ExternalUserListItem[]; total: number };
}
