import { DataSource } from "typeorm";
import { JWTPayload } from "jose";
import * as hiddenAccountsService from "../services/hiddenAccounts";

export async function getHiddenAccountsController(
  ds: DataSource,
  payload: JWTPayload,
) {
  const userId = payload.sub!;
  const hiddenAccounts = await hiddenAccountsService.getHiddenAccounts(ds, userId);
  return { status: 200, body: { hiddenAccounts } };
}

export async function addHiddenAccountController(
  ds: DataSource,
  payload: JWTPayload,
  params: { accountId?: unknown },
) {
  const userId = payload.sub!;

  const accountId =
    typeof params.accountId === "string" ? params.accountId.trim() : null;
  if (!accountId) {
    return {
      status: 400,
      body: { error: "invalid_account_id", message: "accountId is required" },
    };
  }

  const { created } = await hiddenAccountsService.addHiddenAccount(
    ds,
    userId,
    accountId,
  );

  const hiddenAccounts = await hiddenAccountsService.getHiddenAccounts(ds, userId);

  return {
    status: created ? 201 : 200,
    body: { hiddenAccounts },
  };
}

export async function removeHiddenAccountController(
  ds: DataSource,
  payload: JWTPayload,
  params: { accountId: string },
) {
  const userId = payload.sub!;

  const { deleted } = await hiddenAccountsService.removeHiddenAccount(
    ds,
    userId,
    params.accountId,
  );

  if (!deleted) {
    return { status: 404, body: { error: "account_not_found_in_hidden_list" } };
  }

  const hiddenAccounts = await hiddenAccountsService.getHiddenAccounts(ds, userId);
  return { status: 200, body: { hiddenAccounts } };
}
