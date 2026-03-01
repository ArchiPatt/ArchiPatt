import { DataSource } from "typeorm";
import { UserProfile } from "../db/entities/UserProfile";

export async function findByUsername(ds: DataSource, username: string) {
  return await ds.getRepository(UserProfile).findOne({ where: { username } });
}

export async function findById(ds: DataSource, id: string) {
  return await ds.getRepository(UserProfile).findOne({ where: { id } });
}

export async function listUsers(ds: DataSource) {
  return await ds
    .getRepository(UserProfile)
    .find({ order: { createdAt: "DESC" } });
}

export async function listUsersPaginated(
  ds: DataSource,
  limit: number,
  offset: number,
) {
  const [rows, total] = await ds.getRepository(UserProfile).findAndCount({
    order: { createdAt: "DESC" },
    take: Math.max(1, limit),
    skip: Math.max(0, offset),
  });
  return { rows, total };
}

export async function createUser(
  ds: DataSource,
  input: { username: string; displayName: string | null; roles: string[] },
) {
  const repo = ds.getRepository(UserProfile);
  const exists = await repo.findOne({ where: { username: input.username } });
  if (exists) return { kind: "conflict" as const };
  const user = await repo.save(
    repo.create({
      username: input.username,
      displayName: input.displayName,
      roles: input.roles,
      isBlocked: false,
    }),
  );
  return { kind: "ok" as const, user };
}

export async function setBlocked(
  ds: DataSource,
  id: string,
  isBlocked: boolean,
) {
  const repo = ds.getRepository(UserProfile);
  const user = await repo.findOne({ where: { id } });
  if (!user) return { kind: "not_found" as const };
  user.isBlocked = isBlocked;
  await repo.save(user);
  return { kind: "ok" as const, user };
}

export async function deleteById(ds: DataSource, id: string) {
  await ds.getRepository(UserProfile).delete({ id });
}
