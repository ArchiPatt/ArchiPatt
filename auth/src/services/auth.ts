import { DataSource } from "typeorm";
import { IsNull } from "typeorm";
import { User } from "../db/entities/User";
import { AuthorizationCode } from "../db/entities/AuthorizationCode";
import { RefreshToken } from "../db/entities/RefreshToken";
import { RevokedAccessToken } from "../db/entities/RevokedAccessToken";
import { Session } from "../db/entities/Session";

export async function findUserByUsername(ds: DataSource, username: string) {
  return ds.getRepository(User).findOne({ where: { username } });
}

export async function findUserById(ds: DataSource, id: string) {
  return ds.getRepository(User).findOne({ where: { id } });
}

export async function createUser(ds: DataSource, username: string) {
  const repo = ds.getRepository(User);
  return repo.save(repo.create({ username, passwordHash: null }));
}

export async function setPasswordHash(
  ds: DataSource,
  userId: string,
  hash: string,
) {
  const repo = ds.getRepository(User);
  const user = await repo.findOne({ where: { id: userId } });
  if (!user) return null;
  user.passwordHash = hash;
  await repo.save(user);
  return user;
}

export async function findAuthCodeByCode(ds: DataSource, code: string) {
  return ds.getRepository(AuthorizationCode).findOne({ where: { code } });
}

export async function findSetupTokenForUser(
  ds: DataSource,
  userId: string,
): Promise<AuthorizationCode | null> {
  return ds.getRepository(AuthorizationCode).findOne({
    where: {
      userId,
      clientId: "password-setup",
      consumedAt: IsNull(),
    },
    order: { createdAt: "DESC" },
  });
}

export async function createAuthCode(
  ds: DataSource,
  params: {
    code: string;
    clientId: string;
    userId: string;
    expiresAt: Date;
  },
) {
  const repo = ds.getRepository(AuthorizationCode);
  return repo.save(
    repo.create({
      ...params,
      consumedAt: null,
    }),
  );
}

export async function consumeAuthCode(ds: DataSource, codeRow: AuthorizationCode) {
  codeRow.consumedAt = new Date();
  await ds.getRepository(AuthorizationCode).save(codeRow);
}

export async function findRefreshToken(ds: DataSource, token: string) {
  return ds.getRepository(RefreshToken).findOne({ where: { token } });
}

export async function revokeRefreshToken(
  ds: DataSource,
  tokenRow: RefreshToken,
) {
  tokenRow.revokedAt = new Date();
  await ds.getRepository(RefreshToken).save(tokenRow);
}

export async function createRefreshToken(
  ds: DataSource,
  params: {
    token: string;
    clientId: string;
    username: string;
    scopes: string[];
    expiresAt: Date;
  },
) {
  const repo = ds.getRepository(RefreshToken);
  return repo.save(repo.create({ ...params, revokedAt: null }));
}

export async function findRevokedTokenByJti(ds: DataSource, jti: string) {
  return ds.getRepository(RevokedAccessToken).findOne({ where: { jti } });
}

export async function createRevokedToken(
  ds: DataSource,
  jti: string,
  expiresAt: Date,
) {
  const repo = ds.getRepository(RevokedAccessToken);
  return repo.save(repo.create({ jti, expiresAt }));
}

export async function findSessionBySessionId(
  ds: DataSource,
  sessionId: string,
) {
  return ds.getRepository(Session).findOne({
    where: { sessionId },
  });
}

export async function createSession(
  ds: DataSource,
  params: {
    sessionId: string;
    userId: string;
    username: string;
    expiresAt: Date;
  },
) {
  const repo = ds.getRepository(Session);
  return repo.save(repo.create(params));
}

export async function deleteSessionBySessionId(
  ds: DataSource,
  sessionId: string,
) {
  await ds.getRepository(Session).delete({ sessionId });
}
