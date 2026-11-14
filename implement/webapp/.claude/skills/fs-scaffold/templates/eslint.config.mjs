import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import boundaries from "eslint-plugin-boundaries";

/**
 * Ranh giới tầng — nguồn: .claude/skills/_shared/architecture.md mục 3.
 * Thứ tự elements quan trọng: pattern cụ thể đứng trước.
 * Cú pháp capture `${from.feature}` — kiểm lại README của eslint-plugin-boundaries đã cài
 * (bản mới có thể dùng `{{from.feature}}`).
 */
const F = "src/features/*";

const boundaryRules = {
  files: ["src/**/*.{ts,tsx}"],
  plugins: { boundaries },
  settings: {
    "import/resolver": { typescript: { alwaysTryTypes: true } },
    "boundaries/include": ["src/**/*"],
    "boundaries/elements": [
      { type: "contracts", pattern: [`${F}/contracts/**`], mode: "full", capture: ["feature"] },
      { type: "contracts", pattern: ["src/shared/contracts/**"], mode: "full" },
      { type: "actions", pattern: [`${F}/server/actions.ts`, `${F}/server/actions/**`], mode: "full", capture: ["feature"] },
      { type: "services", pattern: [`${F}/server/services/**`], mode: "full", capture: ["feature"] },
      { type: "queries", pattern: [`${F}/server/queries/**`], mode: "full", capture: ["feature"] },
      { type: "repositories", pattern: [`${F}/server/repositories/**`], mode: "full", capture: ["feature"] },
      { type: "hooks", pattern: [`${F}/hooks/**`], mode: "full", capture: ["feature"] },
      { type: "client", pattern: [`${F}/client/**`], mode: "full", capture: ["feature"] },
      { type: "ui", pattern: [`${F}/ui/**`], mode: "full", capture: ["feature"] },
      { type: "shared-server", pattern: ["src/shared/server/**"], mode: "full" },
      { type: "shared-client", pattern: ["src/shared/client/**"], mode: "full" },
      { type: "shared-ui", pattern: ["src/shared/ui/**"], mode: "full" },
      { type: "lib", pattern: ["src/shared/lib/**"], mode: "full" },
      { type: "i18n", pattern: ["src/shared/i18n/**"], mode: "full" },
      { type: "app-api", pattern: ["src/app/api/**"], mode: "full" },
      { type: "app-page", pattern: ["src/app/**", "src/proxy.ts"], mode: "full" },
    ],
  },
  rules: {
    "boundaries/no-unknown-files": "error",
    "boundaries/element-types": [
      "error",
      {
        default: "disallow",
        message: "${file.type} không được import ${dependency.type} — xem _shared/architecture.md mục 3",
        rules: [
          { from: "contracts", allow: ["contracts"] },
          { from: "lib", allow: ["lib"] },
          { from: "i18n", allow: ["contracts"] },
          { from: "shared-ui", allow: ["shared-ui", "lib"] },
          { from: "ui", allow: ["ui", ["hooks", { feature: "${from.feature}" }], "contracts", "shared-ui", "lib", "i18n"] },
          { from: "hooks", allow: [["actions", { feature: "${from.feature}" }], ["client", { feature: "${from.feature}" }], ["hooks", { feature: "${from.feature}" }], "contracts", "shared-client", "lib", "i18n"] },
          { from: "client", allow: [["client", { feature: "${from.feature}" }], "contracts", "shared-client", "lib"] },
          { from: "shared-client", allow: ["shared-client", "contracts", "lib"] },
          { from: "actions", allow: [["services", { feature: "${from.feature}" }], "contracts", "shared-server"] },
          { from: "app-api", allow: ["services", "contracts", "shared-server"] },
          { from: "services", allow: ["services", "repositories", "contracts", "shared-server", "lib"] },
          { from: "queries", allow: ["queries", "repositories", "contracts", "shared-server", "lib"] },
          { from: "repositories", allow: ["repositories", "contracts", "shared-server", "lib"] },
          { from: "shared-server", allow: ["shared-server", "contracts", "lib", "i18n"] },
          { from: "app-page", allow: ["app-page", "ui", "queries", "shared-ui", "shared-server", "i18n", "lib"] },
        ],
      },
    ],
  },
};

// Firebase SDK chỉ được dùng đúng chỗ

const firebaseGuards = [
  {
    files: ["src/features/*/ui/**", "src/features/*/hooks/**", "src/app/**/page.tsx", "src/app/**/layout.tsx"],
    rules: {
      "no-restricted-imports": ["error", { patterns: [
        { group: ["firebase", "firebase/*", "firebase-admin", "firebase-admin/*"], message: "Firebase chỉ dùng trong client/, repositories/ hoặc shared/{client,server}." },
      ] }],
    },
  },
  {
    files: ["src/features/*/client/**", "src/shared/client/**"],
    rules: {
      "no-restricted-imports": ["error", { patterns: [
        { group: ["firebase-admin", "firebase-admin/*"], message: "Admin SDK chỉ ở server." },
      ] }],
    },
  },
];

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  boundaryRules,
  ...firebaseGuards,
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts", ".claude/**", ".work/**"]),
]);

export default eslintConfig;
