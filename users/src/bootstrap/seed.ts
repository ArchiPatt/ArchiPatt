import { DataSource } from "typeorm";
import { env } from "../env";
import { UserProfile } from "../db/entities/UserProfile";

export async function seedInitialUsers(ds: DataSource) {
  const repo = ds.getRepository(UserProfile);

  const admin = await repo.findOne({
    where: { username: env.seed.adminUsername },
  });
  if (!admin) {
    await repo.save(
      repo.create({
        username: env.seed.adminUsername,
        displayName: "Administrator",
        roles: env.seed.adminRoles,
        isBlocked: false,
      }),
    );
  }

  const client = await repo.findOne({
    where: { username: env.seed.clientUsername },
  });
  if (!client) {
    await repo.save(
      repo.create({
        username: env.seed.clientUsername,
        displayName: "Client",
        roles: env.seed.clientRoles,
        isBlocked: false,
      }),
    );
  }
}
