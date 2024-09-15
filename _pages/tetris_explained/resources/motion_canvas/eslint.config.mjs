import js from "@eslint/js";
import ts from "typescript-eslint";

export default [
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: ts.parser,
      parserOptions: { project: true },
    },
    plugins: {
      "@typescript-eslint": ts.plugin,
    },
    rules: {
      ...Object.fromEntries(
        Object.entries({
          ...js.configs.all.rules,
          ...ts.configs.all.filter(
            (config) => config.name == "typescript-eslint/all"
          )[0].rules,
        }).map(([key, value]) => [key, value == "error" ? "warn" : value])
      ),
      "capitalized-comments": "off",
      "id-length": "off",
      "max-lines": "off",
      "max-lines-per-function": "off",
      "max-statements": "off",
      "no-bitwise": "off",
      "no-inline-comments": "off",
      "no-plusplus": ["warn", { allowForLoopAfterthoughts: true }],
      "no-ternary": "off",
      "one-var": "off",
      "sort-keys": "off",
      "@typescript-eslint/prefer-destructuring": [
        "warn",
        { array: false, object: true },
      ],
      "@typescript-eslint/prefer-readonly-parameter-types": "off",
      "@typescript-eslint/consistent-type-imports": "off",
      "@typescript-eslint/init-declarations": "off",
      "@typescript-eslint/no-magic-numbers": "off",
      "@typescript-eslint/no-unnecessary-condition": "off",
      "@typescript-eslint/prefer-nullish-coalescing": "off",
      "@typescript-eslint/strict-boolean-expressions": "off",
    },
  },
];
