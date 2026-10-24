import { MantineProvider } from "@mantine/core";
import { useLocalStorage } from "@mantine/hooks";
import type { ReactNode } from "react";
import { appThemes, defaultAppThemeId, isAppThemeId, type AppThemeId } from ".";
import { AppThemeContext } from "./context";

function deserializeThemeId(value: string | undefined): AppThemeId {
  try {
    const parsed: unknown = JSON.parse(value ?? "null");
    return isAppThemeId(parsed) ? parsed : defaultAppThemeId;
  } catch {
    return defaultAppThemeId;
  }
}

export default function AppThemeProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [themeId, setThemeId] = useLocalStorage<AppThemeId>({
    key: "kotkangrilli-theme",
    defaultValue: defaultAppThemeId,
    deserialize: deserializeThemeId,
    getInitialValueInEffect: false,
  });
  const selectedTheme = appThemes[themeId];

  return (
    <AppThemeContext value={{ themeId, setThemeId }}>
      <MantineProvider
        theme={selectedTheme.theme}
        cssVariablesResolver={selectedTheme.cssVariablesResolver}
        defaultColorScheme="dark"
      >
        {children}
      </MantineProvider>
    </AppThemeContext>
  );
}
