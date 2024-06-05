import { defineConfig } from "vitest/config";
import { loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  process.env = { ...process.env, ...env };

  return {
    base: process.env.CI ? "/azure-feature-flags" : undefined,
    build: {
      minify: true,
      rollupOptions: {
        external: ["node:crypto"],
        output: {
          manualChunks: (id) => {
            if (id.includes("/node_modules/@azure")) return "azure";
            if (
              id.includes("/node_modules/react") ||
              id.includes("/node_modules/scheduler")
            ) {
              return "react";
            }
          },
        },
      },
    },
    plugins: [react() as any, tailwindcss()],
    test: {
      coverage: { include: ["src"] },
      dir: "tests",
      benchmark: {},
    },
  };
});
