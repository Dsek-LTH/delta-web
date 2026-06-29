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
  output: "static",
  server: {
    host: "0.0.0.0",
    port: 8080,
  },
  integrations: [icon()],
});