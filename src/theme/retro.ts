import {
  Accordion,
  ActionIcon,
  AppShell,
  Avatar,
  Badge,
  Button,
  Card,
  createTheme,
  defaultVariantColorsResolver,
  getContrastColor,
  Input,
  Menu,
  Modal,
  NavLink,
  Paper,
  parseThemeColor,
  Popover,
  rgba,
  Table,
  Tabs,
  Title,
} from "@mantine/core";
import classes from "./retro.module.css";
import type { AppThemeCssVariablesResolver, AppThemeDefinition } from "./types";

const theme = createTheme({
  primaryColor: "phosphor",
  primaryShade: { light: 8, dark: 4 },
  autoContrast: true,
  luminanceThreshold: 0.179,
  variantColorResolver: (input) => {
    const resolved = defaultVariantColorsResolver(input);
    const parsed = parseThemeColor({
      color: input.color || input.theme.primaryColor,
      theme: input.theme,
    });

    // Unshaded palettes can use different filled colors in each color scheme.
    // Resolve their text contrast through scheme-specific CSS variables too.
    if (
      input.variant === "filled" &&
      (input.autoContrast ?? input.theme.autoContrast) &&
      parsed.isThemeColor &&
      parsed.shade === undefined
    ) {
      return {
        ...resolved,
        color: `var(--mantine-color-${parsed.color}-contrast)`,
      };
    }

    return resolved;
  },
  cursorType: "pointer",
  defaultRadius: "xs",
  radius: { xs: "0", sm: "0", md: "0", lg: "0", xl: "0" },
  fontFamily: "Tahoma, Verdana, Arial, sans-serif",
  fontFamilyMonospace: '"Lucida Console", "Courier New", monospace',
  fontSizes: {
    xs: "0.75rem",
    sm: "0.8125rem",
    md: "0.875rem",
    lg: "1rem",
    xl: "1.125rem",
  },
  spacing: {
    xs: "0.375rem",
    sm: "0.625rem",
    md: "0.875rem",
    lg: "1.125rem",
    xl: "1.5rem",
  },
  headings: {
    fontFamily: "Tahoma, Verdana, Arial, sans-serif",
    fontWeight: "700",
    sizes: {
      h1: { fontSize: "1.5rem", lineHeight: "1.25" },
      h2: { fontSize: "1.25rem", lineHeight: "1.3" },
      h3: { fontSize: "1.0625rem", lineHeight: "1.35" },
      h4: { fontSize: "0.9375rem", lineHeight: "1.4" },
    },
  },
  colors: {
    dark: [
      "#e2e3d9",
      "#cacdbf",
      "#aeb2a3",
      "#8b927e",
      "#666e59",
      "#4b5241",
      "#3a4033",
      "#30362b",
      "#24291f",
      "#191e16",
    ],
    phosphor: [
      "#f4f8e7",
      "#e5edc9",
      "#d2dfa8",
      "#c0d18b",
      "#adbf73",
      "#96aa59",
      "#7c9043",
      "#637633",
      "#4d5f26",
      "#38471b",
    ],
    amber: [
      "#fff8e5",
      "#ffedbd",
      "#ffdc85",
      "#ffca50",
      "#f5b632",
      "#df9b17",
      "#bb7c0a",
      "#956009",
      "#754b0d",
      "#5b3a0e",
    ],
  },
  shadows: {
    xs: "1px 1px 0 rgb(0 0 0 / 50%)",
    sm: "2px 2px 0 rgb(0 0 0 / 50%)",
    md: "3px 3px 0 rgb(0 0 0 / 50%)",
    lg: "4px 4px 0 rgb(0 0 0 / 50%)",
    xl: "5px 5px 0 rgb(0 0 0 / 50%)",
  },
  components: {
    AppShell: AppShell.extend({
      classNames: {
        header: classes.header,
        navbar: classes.navbar,
        main: classes.main,
      },
    }),
    Paper: Paper.extend({
      defaultProps: { withBorder: true },
      classNames: { root: classes.panel },
    }),
    Card: Card.extend({
      defaultProps: { withBorder: true, radius: "md", shadow: "xs" },
      classNames: { root: classes.panel },
    }),
    Button: Button.extend({ classNames: { root: classes.button } }),
    ActionIcon: ActionIcon.extend({ classNames: { root: classes.button } }),
    Avatar: Avatar.extend({ defaultProps: { radius: 0 } }),
    Input: Input.extend({ classNames: { input: classes.input } }),
    Badge: Badge.extend({
      defaultProps: { radius: "xs", variant: "outline" },
      classNames: { root: classes.badge },
    }),
    NavLink: NavLink.extend({
      classNames: { root: classes.navLink, label: classes.navLabel },
    }),
    Title: Title.extend({ classNames: { root: classes.title } }),
    Accordion: Accordion.extend({
      classNames: {
        item: classes.accordionItem,
        control: classes.accordionControl,
      },
    }),
    Menu: Menu.extend({ classNames: { dropdown: classes.dropdown } }),
    Popover: Popover.extend({ classNames: { dropdown: classes.dropdown } }),
    Modal: Modal.extend({
      classNames: {
        content: classes.modal,
        header: classes.modalHeader,
        title: classes.modalTitle,
      },
    }),
    Table: Table.extend({
      defaultProps: { highlightOnHover: true },
      classNames: { th: classes.tableHeading },
    }),
    Tabs: Tabs.extend({
      defaultProps: { variant: "outline" },
      classNames: { list: classes.tabsList, tab: classes.tab },
    }),
  },
});

// Mantine merges these theme tokens with its native v9 CSS variables.
const cssVariablesResolver: AppThemeCssVariablesResolver = (mantineTheme) => {
  // Foregrounds are chosen for our olive surfaces, independently of the
  // brighter filled controls and the solid backgrounds of light variants.
  const lightForegrounds = {
    red: "#8f2525",
    yellow: mantineTheme.colors.amber[9],
    green: "#24552d",
    grape: "#6b287a",
    teal: "#1b554a",
    gray: "#414937",
    phosphor: mantineTheme.colors.phosphor[9],
    amber: mantineTheme.colors.amber[9],
  };
  const lightVariantVariables = Object.fromEntries(
    Object.entries(lightForegrounds).flatMap(([color, foreground]) => [
      [`--mantine-color-${color}-text`, foreground],
      [`--mantine-color-${color}-outline`, foreground],
      [`--mantine-color-${color}-outline-hover`, rgba(foreground, 0.1)],
      [`--mantine-color-${color}-light-color`, foreground],
    ]),
  );
  const contrastVariables = (colorScheme: "light" | "dark") =>
    Object.fromEntries(
      Object.keys(mantineTheme.colors).map((color) => [
        `--mantine-color-${color}-contrast`,
        getContrastColor({
          color,
          theme: mantineTheme,
          colorScheme,
          autoContrast: true,
        }),
      ]),
    );
  // Outline actions use visible hues independently of the filled button shade.
  const darkVariantVariables = Object.fromEntries(
    Object.entries(mantineTheme.colors).flatMap(([color, shades]) => {
      const foreground = shades[color === "dark" ? 0 : 4];
      return [
        [`--mantine-color-${color}-outline`, foreground],
        [`--mantine-color-${color}-outline-hover`, rgba(foreground, 0.1)],
      ];
    }),
  );

  return {
    variables: {
      "--kg-frame-width": "2px",
      "--kg-outset-border":
        "var(--kg-bevel-light) var(--kg-bevel-dark) var(--kg-bevel-dark) var(--kg-bevel-light)",
      "--kg-inset-border":
        "var(--kg-bevel-dark) var(--kg-bevel-light) var(--kg-bevel-light) var(--kg-bevel-dark)",
    },
    dark: {
      ...contrastVariables("dark"),
      ...darkVariantVariables,
      "--mantine-color-body": mantineTheme.colors.dark[9],
      "--mantine-color-text": mantineTheme.colors.dark[0],
      "--mantine-color-dimmed": mantineTheme.colors.dark[2],
      "--kg-surface": mantineTheme.colors.dark[7],
      "--kg-surface-raised": mantineTheme.colors.dark[6],
      "--kg-recessed": mantineTheme.colors.dark[9],
      "--kg-border": mantineTheme.colors.dark[5],
      "--kg-rule": "#7c866a",
      "--kg-bevel-light": "#737b65",
      "--kg-bevel-dark": "#11160e",
      "--kg-titlebar": "#454f36",
      "--kg-titlebar-text": "#f4f6e9",
      "--kg-selection": "#4e5e37",
      "--kg-selection-text": "#eff4df",
      "--kg-accent": mantineTheme.colors.phosphor[4],
      "--kg-amber": mantineTheme.colors.amber[3],
    },
    light: {
      ...contrastVariables("light"),
      ...lightVariantVariables,
      "--mantine-color-body": "#919785",
      "--mantine-color-text": "#20251b",
      "--mantine-color-dimmed": "#4a5140",
      "--kg-surface": "#c5c9b8",
      "--kg-surface-raised": "#d3d6c7",
      "--kg-recessed": "#edf0df",
      "--kg-border": "#8d957e",
      "--kg-rule": "#626c54",
      "--kg-bevel-light": "#f4f6e9",
      "--kg-bevel-dark": "#525c43",
      "--kg-titlebar": "#616f49",
      "--kg-titlebar-text": "#f4f6e9",
      "--kg-selection": "#4d5f26",
      "--kg-selection-text": "#f4f8e7",
      "--kg-accent": mantineTheme.colors.phosphor[8],
      "--kg-amber": mantineTheme.colors.amber[8],
    },
  };
};

export const retroTheme = {
  label: "LAN",
  theme,
  cssVariablesResolver,
} satisfies AppThemeDefinition;
