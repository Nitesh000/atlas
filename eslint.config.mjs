import { config as baseConfig } from "@atlas/eslint-config/base";

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...baseConfig,
  {
    ignores: [
      "**/dist/**",
      "**/node_modules/**",
      "apps/dashboard/src/routeTree.gen.ts",
      ".next/**",
      "drizzle/**"
    ],
  },
];
