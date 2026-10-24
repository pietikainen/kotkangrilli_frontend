import path from "node:path";
import { fileURLToPath } from "node:url";
import eslintReact from "@eslint-react/eslint-plugin";
import pluginJs from "@eslint/js";
import pluginQuery from "@tanstack/eslint-plugin-query";
import eslintConfigPrettier from "eslint-config-prettier";
import globals from "globals";
import tseslint from "typescript-eslint";

const tsconfigRootDir = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('eslint').Linter.Config[]} */
export default [
  ...pluginQuery.configs["flat/recommended"],
  {
    files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
  },
  { ignores: ["dist", "routeTree.gen.ts"] },
  {
    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        tsconfigRootDir,
      },
    },
  },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  eslintReact.configs.recommended,
  {
    rules: {
      "@eslint-react/jsx-no-children-prop": "off",
    },
  },
  eslintConfigPrettier,
];
