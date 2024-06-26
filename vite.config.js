import { defineConfig } from "vite";

export default defineConfig({
  base: "/blender_begining/",
  build: {
    chunkSizeWarningLimit: 100000000,
  },
});
