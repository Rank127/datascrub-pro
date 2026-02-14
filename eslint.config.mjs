import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import security from "eslint-plugin-security";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  // Security plugin — detect unsafe patterns (eval, regex DoS, SQL injection, etc.)
  {
    plugins: { security },
    rules: {
      "security/detect-object-injection": "off", // Too many false positives with TypeScript
      "security/detect-non-literal-regexp": "warn",
      "security/detect-unsafe-regex": "error",
      "security/detect-buffer-noassert": "error",
      "security/detect-eval-with-expression": "error",
      "security/detect-no-csrf-before-method-override": "error",
      "security/detect-possible-timing-attacks": "warn",
    },
  },
  // Downgrade overly strict react-hooks rules to warnings
  // These rules flag valid patterns like:
  // - setState in useEffect for hydration (common SSR pattern)
  // - Conditional component rendering with JSX expressions
  {
    rules: {
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/static-components": "warn",
    },
  },
]);

export default eslintConfig;
