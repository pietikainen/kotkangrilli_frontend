import type { MantineTheme, MantineThemeOverride } from "@mantine/core";

// Shared app compositions use these tokens. Native controls are styled with
// the theme's Mantine component extensions and normal design tokens.
export type AppThemeToken =
  | "--kg-surface"
  | "--kg-surface-raised"
  | "--kg-recessed"
  | "--kg-border"
  | "--kg-rule"
  | "--kg-bevel-light"
  | "--kg-bevel-dark"
  | "--kg-titlebar"
  | "--kg-titlebar-text"
  | "--kg-selection"
  | "--kg-selection-text"
  | "--kg-accent"
  | "--kg-amber";

type AppThemeSharedToken =
  "--kg-frame-width" | "--kg-outset-border" | "--kg-inset-border";

type AppThemeSchemeVariables = Record<AppThemeToken, string> &
  Record<string, string>;

export type AppThemeCssVariablesResolver = (theme: MantineTheme) => {
  variables: Record<AppThemeSharedToken, string> & Record<string, string>;
  light: AppThemeSchemeVariables;
  dark: AppThemeSchemeVariables;
};

export type AppThemeDefinition = {
  label: string;
  theme: MantineThemeOverride;
  cssVariablesResolver: AppThemeCssVariablesResolver;
};
