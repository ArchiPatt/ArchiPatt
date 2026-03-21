import { DataSource } from "typeorm";
import { UserColorScheme } from "../db/entities/UserColorScheme";
import { ColorScheme, COLOR_SCHEME_VALUES } from "../db/enums/ColorScheme";

export function parseColorScheme(value: unknown): ColorScheme | null {
  if (
    typeof value === "string" &&
    COLOR_SCHEME_VALUES.includes(value as ColorScheme)
  ) {
    return value as ColorScheme;
  }
  return null;
}

export async function getColorScheme(
  ds: DataSource,
  userId: string,
): Promise<ColorScheme> {
  const repo = ds.getRepository(UserColorScheme);
  const record = await repo.findOneBy({ userId });
  return record?.colorScheme ?? ColorScheme.Auto;
}

export async function setColorScheme(
  ds: DataSource,
  userId: string,
  colorScheme: ColorScheme,
): Promise<ColorScheme> {
  const repo = ds.getRepository(UserColorScheme);

  await repo.upsert(
    { userId, colorScheme },
    { conflictPaths: ["userId"] },
  );

  return colorScheme;
}
