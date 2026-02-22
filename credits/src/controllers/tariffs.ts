import { DataSource } from "typeorm";
import { JWTPayload } from "jose";
import { requireAuth, isEmployee } from "./auth";
import { createTariff, listActiveTariffs } from "../services/tariffs";

export async function listTariffsController(ds: DataSource, payload: JWTPayload | null) {
  const a = requireAuth(payload);
  if (!a.ok) return { status: a.code, body: { error: "unauthorized" } };

  const tariffs = await listActiveTariffs(ds);
  return { status: 200 as const, body: tariffs };
}

export async function createTariffController(
  ds: DataSource,
  payload: JWTPayload | null,
  body: { name?: string; interestRate?: number; billingPeriodDays?: number }
) {
  const a = requireAuth(payload);
  if (!a.ok) return { status: a.code, body: { error: "unauthorized" } };
  if (!isEmployee(a.payload)) return { status: 403 as const, body: { error: "forbidden" } };

  const name = body.name?.trim();
  const interestRate = body.interestRate;
  const billingPeriodDays = body.billingPeriodDays ?? 1;

  if (!name || typeof interestRate !== "number" || interestRate < 0) {
    return { status: 400 as const, body: { error: "invalid_input" } };
  }
  if (!Number.isInteger(billingPeriodDays) || billingPeriodDays <= 0) {
    return { status: 400 as const, body: { error: "invalid_billing_period" } };
  }

  const res = await createTariff(ds, { name, interestRate, billingPeriodDays });
  if (res.kind === "conflict") return { status: 409 as const, body: { error: "tariff_exists" } };
  return { status: 201 as const, body: res.tariff };
}

