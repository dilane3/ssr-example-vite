import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: "./index.html",
      },
    },
    target: 'esnext',
    outDir: 'dist',
    assetsDir: 'assets',
    // minify: 'terser',
    sourcemap: false,
  },
});
