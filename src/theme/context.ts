import { createContext, use } from "react";
import type { AppThemeId } from ".";

export const AppThemeContext = createContext<{
  themeId: AppThemeId;
  setThemeId: (themeId: AppThemeId) => void;
} | null>(null);

export function useAppTheme() {
  const context = use(AppThemeContext);
  if (!context) {
    throw new Error("useAppTheme must be used within AppThemeProvider");
  }
  return context;
}
