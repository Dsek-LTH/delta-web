// @ts-check
import { defineConfig } from "astro/config";
import bun from "@wyattjoh/astro-bun-adapter";
import tailwindcss from "@tailwindcss/vite";
import icon from "astro-icon";

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
  },
  adapter: bun(),
  output: "server",
  server: {
    host: "0.0.0.0",
    port: 8080,
  },
  integrations: [icon()],
  security: {
    allowedDomains: [
      { hostname: "delta.dsek.se", protocol: "https" },
      { hostname: "delta-staging.dsek.se", protocol: "https" },
    ],
  },
});
