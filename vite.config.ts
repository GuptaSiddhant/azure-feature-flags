import { defineConfig } from "vitest/config";
import { loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  process.env = { ...process.env, ...env };

  return {
    test: {
      coverage: { include: ["src"] },
      dir: "tests",
      benchmark: {},
    },
    base: process.env.CI ? "azure-feature-flags" : undefined,
    plugins: [react() as any, tailwindcss()],
  };
});
