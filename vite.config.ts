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
      minify: false,
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            if (id.includes("/node_modules/react")) return "react";
            if (id.includes("/node_modules/@azure")) return "azure";
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
