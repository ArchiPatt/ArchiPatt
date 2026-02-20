import AppDataSource from "../constants/appDataSource";

export async function initDataSource() {
  if (AppDataSource.isInitialized) return AppDataSource;
  await AppDataSource.initialize();
  return AppDataSource;
}
