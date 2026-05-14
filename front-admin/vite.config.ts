import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  base: "/admin/",
  plugins: [vue()],
  server: {
    host: true,
    port: 5176,
  },
  resolve: {
    conditions: ["source"],
    alias: {
      "@": "/src",
      "@types": "/src/types",
      "@composables": "/src/composables",
      "@components": "/src/components",
    },
  },
});
