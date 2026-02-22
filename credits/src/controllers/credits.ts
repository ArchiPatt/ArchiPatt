import { DataSource } from "typeorm";
import { JWTPayload } from "jose";
import { requireAuth, isEmployee } from "./auth";
import {
  accrueDueCredits,
  findActiveTariff,
  getCreditById,
  issueCredit,
  listCreditsByClient,
  listPayments,
  repayCredit
} from "../services/credits";
import { postAccountOperation } from "../integrations/core-service";

export async function issueCreditController(
  ds: DataSource,
  payload: JWTPayload | null,
  body: { clientId?: string; accountId?: string; tariffId?: string; amount?: number }
) {
  const a = requireAuth(payload);
  if (!a.ok) return { status: a.code, body: { error: "unauthorized" } };

  const clientId = body.clientId;
  const accountId = body.accountId;
  const tariffId = body.tariffId;
  const amount = body.amount;

  if (!clientId || !accountId || !tariffId || typeof amount !== "number" || amount <= 0) {
    return { status: 400 as const, body: { error: "invalid_input" } };
  }

  const isOwner = String(a.payload.sub ?? "") === clientId;
  const allowed = isEmployee(a.payload) || isOwner;
  if (!allowed) return { status: 403 as const, body: { error: "forbidden" } };

  const tariff = await findActiveTariff(ds, tariffId);
  if (!tariff) return { status: 404 as const, body: { error: "tariff_not_found" } };

  const { credit, payment } = await issueCredit(ds, {
    clientId,
    accountId,
    tariffId,
    amount,
    billingPeriodDays: tariff.billingPeriodDays,
    performedBy: String(a.payload.sub ?? "unknown")
  });

  await postAccountOperation({
    accountId,
    amount,
    kind: "credit",
    idempotencyKey: `credits:issue:${payment.id}`,
    metadata: {
      creditId: credit.id,
      clientId,
      tariffId
    }
  });

  return { status: 201 as const, body: credit };
}

export async function repayCreditController(
  ds: DataSource,
  payload: JWTPayload | null,
  params: { id: string },
  body: { amount?: number }
) {
  const a = requireAuth(payload);
  if (!a.ok) return { status: a.code, body: { error: "unauthorized" } };

  const amount = body.amount;
  if (typeof amount !== "number" || amount <= 0) {
    return { status: 400 as const, body: { error: "invalid_amount" } };
  }

  const existing = await getCreditById(ds, params.id);
  if (!existing) return { status: 404 as const, body: { error: "credit_not_found" } };

  const isOwner = String(a.payload.sub ?? "") === existing.clientId;
  const allowed = isEmployee(a.payload) || isOwner;
  if (!allowed) return { status: 403 as const, body: { error: "forbidden" } };

  const res = await repayCredit(ds, { creditId: params.id, amount, performedBy: String(a.payload.sub ?? "unknown") });
  if (res.kind === "not_found") return { status: 404 as const, body: { error: "credit_not_found" } };
  if (res.kind === "not_active") return { status: 400 as const, body: { error: "credit_not_active" } };

  await postAccountOperation({
    accountId: existing.accountId,
    amount,
    kind: "debit",
    idempotencyKey: `credits:repay:${res.payment.id}`,
    metadata: {
      creditId: existing.id,
      clientId: existing.clientId
    }
  });

  return {
    status: 200 as const,
    body: {
      id: res.credit.id,
      status: res.credit.status,
      outstandingAmount: res.credit.outstandingAmount,
      closedAt: res.credit.closedAt
    }
  };
}

export async function creditsByClientController(ds: DataSource, payload: JWTPayload | null, params: { clientId: string }) {
  const a = requireAuth(payload);
  if (!a.ok) return { status: a.code, body: { error: "unauthorized" } };

  const isOwner = String(a.payload.sub ?? "") === params.clientId;
  const allowed = isEmployee(a.payload) || isOwner;
  if (!allowed) return { status: 403 as const, body: { error: "forbidden" } };

  const credits = await listCreditsByClient(ds, params.clientId);
  return { status: 200 as const, body: credits };
}

export async function creditDetailsController(ds: DataSource, payload: JWTPayload | null, params: { id: string }) {
  const a = requireAuth(payload);
  if (!a.ok) return { status: a.code, body: { error: "unauthorized" } };

  const credit = await getCreditById(ds, params.id);
  if (!credit) return { status: 404 as const, body: { error: "credit_not_found" } };

  const isOwner = String(a.payload.sub ?? "") === credit.clientId;
  const allowed = isEmployee(a.payload) || isOwner;
  if (!allowed) return { status: 403 as const, body: { error: "forbidden" } };

  return { status: 200 as const, body: credit };
}

export async function creditPaymentsController(ds: DataSource, payload: JWTPayload | null, params: { id: string }) {
  const a = requireAuth(payload);
  if (!a.ok) return { status: a.code, body: { error: "unauthorized" } };

  const credit = await getCreditById(ds, params.id);
  if (!credit) return { status: 404 as const, body: { error: "credit_not_found" } };

  const isOwner = String(a.payload.sub ?? "") === credit.clientId;
  const allowed = isEmployee(a.payload) || isOwner;
  if (!allowed) return { status: 403 as const, body: { error: "forbidden" } };

  const payments = await listPayments(ds, params.id);
  return { status: 200 as const, body: payments };
}

export async function runAccrualController(ds: DataSource, payload: JWTPayload | null) {
  const a = requireAuth(payload);
  if (!a.ok) return { status: a.code, body: { error: "unauthorized" } };
  if (!isEmployee(a.payload)) return { status: 403 as const, body: { error: "forbidden" } };
  const result = await accrueDueCredits(ds);
  return { status: 200 as const, body: result };
}

