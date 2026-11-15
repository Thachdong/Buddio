import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import boundaries from "eslint-plugin-boundaries";

/**
 * Ranh giới tầng — nguồn: .claude/skills/_shared/architecture.md mục 3.
 * Cú pháp eslint-plugin-boundaries v7 (rule `boundaries/dependencies`, `policies`, selector object, template {{ }}).
 * Element descriptor khớp theo folder, partialMatch: false → pattern tính từ gốc project.
 */
const F = "src/features/*";

const el = (type, pattern, capture) => ({ type, pattern, partialMatch: false, ...(capture ? { capture } : {}) });

/** Selector đích. sameFeature = chỉ cho import trong cùng feature. */
const to = (type, sameFeature = false) => ({
  to: {
    element: sameFeature
      ? { type, captured: { feature: "{{ from.element.captured.feature }}" } }
      : { type },
  },
});
const policy = (fromType, allow) => ({ from: { element: { type: fromType } }, allow });

const boundaryRules = {
  files: ["src/**/*.{ts,tsx}"],
  plugins: { boundaries },
  settings: {
    "import/resolver": { typescript: { alwaysTryTypes: true } },
    "boundaries/include": ["src/**/*"],
    "boundaries/elements": [
      el("contracts", `${F}/contracts`, ["feature"]),
      el("contracts", "src/shared/contracts"),
      el("services", `${F}/server/services`, ["feature"]),
      el("queries", `${F}/server/queries`, ["feature"]),
      el("repositories", `${F}/server/repositories`, ["feature"]),
      // phần còn lại của server/ = actions.ts (hoặc actions/) — phải đứng SAU 3 dòng trên
      el("actions", `${F}/server`, ["feature"]),
      el("hooks", `${F}/hooks`, ["feature"]),
      el("client", `${F}/client`, ["feature"]),
      el("ui", `${F}/ui`, ["feature"]),
      el("shared-server", "src/shared/server"),
      el("shared-client", "src/shared/client"),
      el("shared-ui", "src/shared/ui"),
      el("lib", "src/shared/lib"),
      el("i18n", "src/shared/i18n"),
      el("app-api", "src/app/api"),
      el("app-page", "src/app"),
    ],
    // proxy.ts (middleware v16) chỉ redirect lạc quan; test + helper test được import chéo tầng
    "boundaries/ignore": ["src/proxy.ts", "src/test/**", "src/**/*.test.ts", "src/**/*.test.tsx"],
  },
  rules: {
    "boundaries/no-unknown-files": "error",
    "boundaries/dependencies": [
      "error",
      {
        default: "disallow",
        message:
          "{{ from.element.types.[0] }} không được import {{ to.element.types.[0] }} — xem .claude/skills/_shared/architecture.md mục 3",
        policies: [
          policy("contracts", [to("contracts")]),
          policy("lib", [to("lib")]),
          policy("i18n", [to("contracts")]),
          policy("shared-ui", [to("shared-ui"), to("lib")]),
          policy("ui", [to("ui"), to("hooks", true), to("contracts"), to("shared-ui"), to("lib"), to("i18n")]),
          policy("hooks", [to("actions", true), to("client", true), to("hooks", true), to("contracts"), to("shared-client"), to("lib"), to("i18n")]),
          policy("client", [to("client", true), to("contracts"), to("shared-client"), to("lib")]),
          policy("shared-client", [to("shared-client"), to("contracts"), to("lib")]),
          policy("actions", [to("services", true), to("contracts"), to("shared-server")]),
          policy("app-api", [to("services"), to("contracts"), to("shared-server")]),
          policy("services", [to("services"), to("repositories"), to("contracts"), to("shared-server"), to("lib")]),
          policy("queries", [to("queries"), to("repositories"), to("contracts"), to("shared-server"), to("lib")]),
          policy("repositories", [to("repositories"), to("contracts"), to("shared-server"), to("lib")]),
          policy("shared-server", [to("shared-server"), to("contracts"), to("lib"), to("i18n")]),
          policy("app-page", [to("app-page"), to("ui"), to("queries"), to("shared-ui"), to("shared-server"), to("i18n"), to("lib")]),
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
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts", ".claude/**", ".work/**", "functions/**", "playwright-report/**", "test-results/**"]),
]);

export default eslintConfig;
