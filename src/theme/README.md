# App themes

`index.ts` is the theme registry. LAN is the only registered theme and
remains the default. Mantine's default appearance is not a selectable theme.

`AppThemeProvider` applies the selected theme through MantineProvider. The choice
is saved under `kotkangrilli-theme` in local storage and synced between tabs.
Unknown, removed, or malformed saved choices fall back to LAN.

Theme choice is independent of Mantine's light/dark/system setting. Changing a
theme updates MantineProvider in place, preserving route and form state.

## Adding a theme

1. Create a theme definition, following `retro.ts`. Export an object that
   `satisfies AppThemeDefinition` from `types.ts`.
2. Define the Mantine theme and component extensions with `createTheme`. Keep
   theme-specific component classes in that theme's CSS module.
3. Provide the shared app tokens for both color schemes. `types.ts` checks that
   the resolver supplies all required tokens. Native Mantine variables can also
   be overridden through this resolver; Mantine supplies the remaining v9 defaults.
4. Import the definition in `index.ts` and add it to `appThemes` with a stable key.

For example, after creating a `terminalTheme` definition:

```ts
export const appThemes = {
  retro: retroTheme,
  terminal: terminalTheme,
} satisfies Record<string, AppThemeDefinition>;
```

`ThemeSwitcher` automatically lists registered themes and appears on desktop,
in the mobile navigation, and on the login screen when at least two exist.

Shared compositions, such as SectionPanel and payment groups, use app tokens for
surfaces, title bars, borders, and frame width. They keep their content and
layout while the active theme defines their appearance. Flat borders can use a
single color for `--kg-outset-border` and `--kg-inset-border`; Mantine radius
tokens control component corners. Keep text contrast readable in both schemes.
