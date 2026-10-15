import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

const frontendRoot = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  root: frontendRoot,
  base: "/InvestorMtaani/",
  plugins: [react()],
  build: {
    outDir: fileURLToPath(new URL("./admin-preview-dist/", import.meta.url)),
    emptyOutDir: true,
    rollupOptions: {
      input: fileURLToPath(new URL("./admin-preview.html", import.meta.url)),
    },
  },
});
