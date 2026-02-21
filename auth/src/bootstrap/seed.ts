import { DataSource } from "typeorm";
import bcrypt from "bcryptjs";
import { env } from "../env";
import { User } from "../db/entities/User";
import { OAuthClient } from "../db/entities/OAuthClient";

export async function seedInitialData(ds: DataSource) {
  await seedAdmin(ds);
  await seedClient(ds);
}

async function seedAdmin(ds: DataSource) {
  const repo = ds.getRepository(User);
  const existing = await repo.findOne({
    where: { username: env.seed.adminUsername },
  });
  if (existing) return;

  const passwordHash = await bcrypt.hash(env.seed.adminPassword, 12);
  const user = repo.create({
    username: env.seed.adminUsername,
    passwordHash,
  });
  await repo.save(user);
}

async function seedClient(ds: DataSource) {
  const repo = ds.getRepository(OAuthClient);
  const existing = await repo.findOne({
    where: { clientId: env.seed.clientId },
  });
  if (existing) return;

  const clientSecretHash = env.seed.clientSecret
    ? await bcrypt.hash(env.seed.clientSecret, 12)
    : null;
  const client = repo.create({
    clientId: env.seed.clientId,
    clientSecretHash,
    redirectUris: env.seed.clientRedirectUris,
    allowedScopes: env.seed.clientScopes,
  });
  await repo.save(client);
}
