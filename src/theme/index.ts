import { retroTheme } from "./retro";
import type { AppThemeDefinition } from "./types";

export const appThemes = {
  retro: retroTheme,
} satisfies Record<string, AppThemeDefinition>;

export type AppThemeId = keyof typeof appThemes;

export const defaultAppThemeId: AppThemeId = "retro";

export function isAppThemeId(value: unknown): value is AppThemeId {
  return typeof value === "string" && Object.hasOwn(appThemes, value);
}
