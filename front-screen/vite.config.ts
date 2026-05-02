import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  base: "/screen/",
  plugins: [vue()],
  server: {
    host: true,
    port: 5174,
  },
});
