import { FastifyInstance } from "fastify";
import { createAuthHandlers } from "../handlers/auth";

export function registerAuthRoutes(app: FastifyInstance) {
  const h = createAuthHandlers(app);

  app.get<{ Params: { jti: string } }>(
    "/internal/tokens/revoked/:jti",
    h.internalTokensRevoked,
  );

  app.get("/jwks", h.jwks);

  app.get<{
    Querystring: { return_to?: string; error?: string; prompt?: string };
  }>("/login", h.loginGet);

  app.post<{
    Body: { username?: string; password?: string; return_to?: string };
  }>("/login", h.loginPost);

  app.post<{
    Body: {
      grant_type?: string;
      code?: string;
      refresh_token?: string;
    };
  }>("/token", h.token);

  app.post<{ Body: { username?: string } }>("/internal/users", h.internalUsers);

  app.get<{ Querystring: { token?: string } }>(
    "/setup-password",
    h.setupPasswordGet,
  );

  app.post<{
    Body: { token?: string; password?: string; passwordRepeat?: string };
  }>("/setup-password", h.setupPasswordPost);

  app.post("/logout", h.logout);

  app.get<{ Querystring: { return_to?: string } }>(
    "/logout-session",
    h.logoutSession,
  );
}
