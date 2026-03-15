import { DataSource } from "typeorm";
import { JWTPayload } from "jose";
import * as colorSchemeService from "../services/colorScheme";

export async function getColorSchemeController(
  ds: DataSource,
  payload: JWTPayload,
) {
  const userId = payload.sub!;
  const colorScheme = await colorSchemeService.getColorScheme(ds, userId);
  return { status: 200, body: { colorScheme } };
}

export async function setColorSchemeController(
  ds: DataSource,
  payload: JWTPayload,
  params: { colorScheme?: unknown },
) {
  const userId = payload.sub!;

  const colorScheme = colorSchemeService.parseColorScheme(params.colorScheme);
  if (!colorScheme) {
    return {
      status: 400,
      body: { error: "invalid_color_scheme", message: "colorScheme must be one of: dark, light, auto" },
    };
  }

  const result = await colorSchemeService.setColorScheme(ds, userId, colorScheme);
  return { status: 200, body: { colorScheme: result } };
}
