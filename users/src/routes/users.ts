import { FastifyInstance } from "fastify";
import { createUsersHandlers } from "../handlers/users";

export function registerUsersRoutes(app: FastifyInstance) {
  const h = createUsersHandlers(app);

  app.get("/internal/users/by-username/:username", h.internalByUsername);
  app.get("/internal/users", h.internalList);
  app.get("/me", h.me);
  app.get("/users", h.list);
  app.get("/users/:id", h.get);
  app.post("/users", h.create);
  app.patch("/users/:id/block", h.block);
}
