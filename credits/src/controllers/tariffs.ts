import { DataSource } from "typeorm";
import { JWTPayload } from "jose";
import { isEmployee } from "./auth";
import * as creditsService from "../services/credits";

export async function listTariffsController(
  ds: DataSource,
  _payload: JWTPayload,
) {
  const tariffs = await creditsService.findActiveTariffs(ds);
  return { status: 200 as const, body: tariffs };
}

export async function getTariffController(
  ds: DataSource,
  _payload: JWTPayload,
  params: { id: string },
) {
  const tariff = await creditsService.findTariffById(ds, params.id);
  if (!tariff)
    return { status: 404 as const, body: { error: "tariff_not_found" } };
  return { status: 200 as const, body: tariff };
}

export async function createTariffController(
  ds: DataSource,
  payload: JWTPayload,
  params: {
    name?: string;
    interestRate?: number;
    billingPeriodDays?: number;
  },
) {
  if (!isEmployee(payload))
    return { status: 403 as const, body: { error: "forbidden" } };

  const name = params.name?.trim();
  const interestRate = params.interestRate;
  const billingPeriodDays = params.billingPeriodDays ?? 1;

  if (!name || typeof interestRate !== "number" || interestRate < 0) {
    return { status: 400 as const, body: { error: "invalid_input" } };
  }
  if (!Number.isInteger(billingPeriodDays) || billingPeriodDays <= 0) {
    return { status: 400 as const, body: { error: "invalid_billing_period" } };
  }

  const exists = await creditsService.findTariffByName(ds, name);
  if (exists) return { status: 409 as const, body: { error: "tariff_exists" } };

  const tariff = await creditsService.createTariff(ds, {
    name,
    interestRate: interestRate.toFixed(4),
    billingPeriodDays,
  });
  return { status: 201 as const, body: tariff };
}
