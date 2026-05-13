import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: process.env.GITHUB_PAGES === "true" ? "/ASWB-Clinical-Prep-Studio/" : "/",
  plugins: [react()],
});
