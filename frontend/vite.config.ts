import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  server: {
    // Local npm dev talks to FastAPI without requiring CORS configuration changes.
    proxy: { "/api": "http://localhost:8000" },
  },
});
