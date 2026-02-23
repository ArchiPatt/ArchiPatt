import { env } from "../env";

export async function createAuthCredentials(input: { username: string }) {
  if (!env.authService.internalToken) {
    throw new Error("AUTH_INTERNAL_TOKEN (or INTERNAL_TOKEN) is not configured");
  }

  const url = `${env.authService.baseUrl}/internal/users`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-internal-token": env.authService.internalToken
    },
    body: JSON.stringify({
      username: input.username
    })
  });

  if (res.status === 409) return { kind: "conflict" as const };
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`auth service error (${res.status}): ${text}`);
  }

  const data = (await res.json()) as { setupUrl?: string };
  return { kind: "ok" as const, setupUrl: data.setupUrl ?? null };
}
