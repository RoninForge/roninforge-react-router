// ANTI-PATTERN: vitePlugin as remix from @remix-run/dev. RR7 needs reactRouter() from @react-router/dev/vite.
import { defineConfig } from "vite";
import { vitePlugin as remix } from "@remix-run/dev";

export default defineConfig({
  plugins: [remix()],
});
