import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { BASE_URL } from "./project.config";

export default defineConfig({
  base: "./",
  server: {
    proxy:
      process.env.NODE_ENV === "production"
        ? {}
        : {
            "/api": {
              target: BASE_URL,
              changeOrigin: true,
              secure: false,
              rewrite: (path) => path.replace(/^\/api/, ""),
            },
          },
  },
  plugins: [react()],
  build: {
    // Production optimizations
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor code for better caching
          "react-vendor": ["react", "react-dom"],
          "google-ai": ["@google/generative-ai"],
        },
      },
    },
    // Enable source maps for debugging if needed
    sourcemap: false,
    // Optimize chunk size
    chunkSizeWarningLimit: 1000,
  },
  // Performance optimizations
  optimizeDeps: {
    include: ["react", "react-dom", "@google/generative-ai"],
  },
});
