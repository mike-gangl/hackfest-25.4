import path from "path";
import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "./app"),
      "@components": path.resolve(__dirname, "./app/components"),
    },
  },
  server: {
    warmup: {
      clientFiles: [
        "./app/root.tsx",
        "./app/routes/**/*",
        "./app/components/**/*",
      ],
    },
  },
  optimizeDeps: {
    include: ["react", "react-dom", "react-router"],
  },
});
