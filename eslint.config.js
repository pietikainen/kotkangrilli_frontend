import pluginJs from "@eslint/js";
import pluginQuery from "@tanstack/eslint-plugin-query";
import mantine from "eslint-config-mantine";
import eslintConfigPrettier from "eslint-config-prettier";
import pluginReact from "eslint-plugin-react";
import globals from "globals";
import tseslint from "typescript-eslint";

/** @type {import('eslint').Linter.Config[]} */
export default [
  ...pluginQuery.configs["flat/recommended"],
  ...mantine,
  {
    files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
  },
  { ignores: ["dist", "routeTree.gen.ts"] },
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  {
    rules: {
      "react/no-children-prop": [
        "error",
        {
          allowFunctions: true,
        },
      ],
    },
  },
  eslintConfigPrettier,
];
