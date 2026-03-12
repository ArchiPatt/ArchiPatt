import { DataSource } from "typeorm";
import { JWTPayload } from "jose";
import { isEmployee } from "./auth";
import { verifyBearerToken } from "../security/jwt";
import * as creditsService from "../services/credits";

export async function listCreditsController(
  ds: DataSource,
  payload: JWTPayload,
) {
  if (!isEmployee(payload))
    return { status: 403 as const, body: { error: "forbidden" } };

  const credits = await creditsService.findCredits(ds);
  return { status: 200 as const, body: credits };
}

export async function getCreditController(
  ds: DataSource,
  payload: JWTPayload,
  params: { id: string },
) {
  const credit = await creditsService.findCreditById(ds, params.id);
  if (!credit)
    return { status: 404 as const, body: { error: "credit_not_found" } };

  const isOwner = String(payload.sub ?? "") === credit.clientId;
  const allowed = isEmployee(payload) || isOwner;
  if (!allowed) return { status: 403 as const, body: { error: "forbidden" } };

  return { status: 200 as const, body: credit };
}

export async function getPaymentsController(
  ds: DataSource,
  payload: JWTPayload,
  params: { id: string },
) {
  const credit = await creditsService.findCreditById(ds, params.id);
  if (!credit)
    return { status: 404 as const, body: { error: "credit_not_found" } };

  const isOwner = String(payload.sub ?? "") === credit.clientId;
  const allowed = isEmployee(payload) || isOwner;
  if (!allowed) return { status: 403 as const, body: { error: "forbidden" } };

  const payments = await creditsService.findPaymentsByCreditId(ds, params.id);
  return { status: 200 as const, body: payments };
}

export async function getCreditsByClientController(
  ds: DataSource,
  payload: JWTPayload,
  params: { clientId: string },
) {
  const isOwner = String(payload.sub ?? "") === params.clientId;
  const allowed = isEmployee(payload) || isOwner;
  if (!allowed) return { status: 403 as const, body: { error: "forbidden" } };

  const credits = await creditsService.findCreditsByClientIds(ds, [
    params.clientId,
  ]);
  return { status: 200 as const, body: credits };
}

export async function getOverdueCreditsController(
  ds: DataSource,
  payload: JWTPayload,
  params: { clientId?: string },
) {
  if (params.clientId) {
    const isOwner = String(payload.sub ?? "") === params.clientId;
    const allowed = isEmployee(payload) || isOwner;
    if (!allowed) return { status: 403 as const, body: { error: "forbidden" } };
  } else {
    if (!isEmployee(payload))
      return { status: 403 as const, body: { error: "forbidden" } };
  }

  const credits = params.clientId
    ? await creditsService.findOverdueCredits(ds, params.clientId)
    : await creditsService.findOverdueCredits(ds);
  return { status: 200 as const, body: credits };
}

export async function getCreditRatingController(
  ds: DataSource,
  payload: JWTPayload,
  params: { clientId: string },
) {
  const isOwner = String(payload.sub ?? "") === params.clientId;
  const allowed = isEmployee(payload) || isOwner;
  if (!allowed) return { status: 403 as const, body: { error: "forbidden" } };

  const rating = await creditsService.calculateCreditRating(ds, params.clientId);
  return { status: 200 as const, body: rating };
}

export async function issueCreditController(
  ds: DataSource,
  payload: JWTPayload,
  params: {
    clientId?: string;
    accountId?: string;
    tariffId?: string;
    amount?: number;
    authorization?: string;
  },
) {
  const clientId = params.clientId;
  const accountId = params.accountId;
  const tariffId = params.tariffId;
  const amount = params.amount;

  if (
    !clientId ||
    !accountId ||
    !tariffId ||
    typeof amount !== "number" ||
    amount <= 0
  ) {
    return { status: 400 as const, body: { error: "invalid_input" } };
  }

  const isOwner = String(payload.sub ?? "") === clientId;
  const allowed = isEmployee(payload) || isOwner;
  if (!allowed) return { status: 403 as const, body: { error: "forbidden" } };

  const credit = await creditsService.issueCredit(ds, {
    clientId,
    accountId,
    tariffId,
    amount,
    performedBy: String(payload.sub ?? "unknown"),
    authorization: params.authorization,
  });

  if (!credit)
    return { status: 404 as const, body: { error: "tariff_not_found" } };
  return { status: 201 as const, body: credit };
}

export async function repayCreditController(
  ds: DataSource,
  payload: JWTPayload,
  params: { id: string; amount?: number; authorization?: string },
) {
  const amount = params.amount;
  if (typeof amount !== "number" || amount <= 0) {
    return { status: 400 as const, body: { error: "invalid_amount" } };
  }

  const existing = await creditsService.findCreditById(ds, params.id);
  if (!existing)
    return { status: 404 as const, body: { error: "credit_not_found" } };

  const isOwner = String(payload.sub ?? "") === existing.clientId;
  const allowed = isEmployee(payload) || isOwner;
  if (!allowed) return { status: 403 as const, body: { error: "forbidden" } };

  const result = await creditsService.repayCredit(ds, {
    creditId: params.id,
    amount,
    performedBy: String(payload.sub ?? "unknown"),
    authorization: params.authorization,
  });

  if (!result) return { status: 404 as const, body: { error: "credit_not_found" } };
  if (result === "not_active")
    return { status: 400 as const, body: { error: "credit_not_active" } };
  return { status: 200 as const, body: result };
}

export async function accrueRunController(
  ds: DataSource,
  payload: JWTPayload,
) {
  if (!isEmployee(payload))
    return { status: 403 as const, body: { error: "forbidden" } };

  const result = await creditsService.accrueDueCredits(ds);
  return { status: 200 as const, body: result };
}

export async function internalByClientsController(
  ds: DataSource,
  internalOk: boolean,
  params: { clientIds?: string },
  authorization?: string,
) {
  if (!internalOk)
    return { status: 401 as const, body: { error: "unauthorized" } };
  if (!authorization?.startsWith("Bearer "))
    return { status: 401 as const, body: { error: "authorization_required" } };
  const payload = await verifyBearerToken(authorization);
  if (!payload)
    return { status: 401 as const, body: { error: "unauthorized" } };

  const clientIdsRaw = params.clientIds?.trim();
  const clientIds = clientIdsRaw
    ? clientIdsRaw
        .split(/[,\s]+/)
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  if (clientIds.length === 0) {
    if (!isEmployee(payload))
      return { status: 403 as const, body: { error: "forbidden" } };
  } else {
    const sub = String(payload.sub ?? "");
    const allowed =
      isEmployee(payload) ||
      (clientIds.length === 1 && clientIds[0] === sub);
    if (!allowed)
      return { status: 403 as const, body: { error: "forbidden" } };
  }

  const credits = await creditsService.findCreditsByClientIds(ds, clientIds);
  return { status: 200 as const, body: credits };
}
