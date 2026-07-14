import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const root = dirname(fileURLToPath(import.meta.url));

// Mirror the module aliases declared in jsconfig.json so `vitest run` resolves
// the same bare specifiers Next.js/turbopack resolve at build time:
//   "@/*"     -> ./src/*
//   "open-sse"   -> ./open-sse
//   "open-sse/*" -> ./open-sse/*
// Without this, 40+ unit files fail on unresolved `open-sse/..` and `@/..` imports.
export default defineConfig({
  resolve: {
    alias: {
      "@": resolve(root, "src"),
      "open-sse": resolve(root, "open-sse"),
    },
  },
  test: {
    include: ["tests/**/*.{test,spec}.{js,ts,tsx}"],
    environment: "node",
    // Real integration tests hit live provider APIs and need credentials/network.
    // They are gated behind RUN_REAL=1 inside the tests themselves; exclude them
    // from the default run so `vitest run` is hermetic.
    exclude: [
      "**/node_modules/**",
      "tests/translator/real/**",
      "tests/e2e/**",
    ],
  },
});
