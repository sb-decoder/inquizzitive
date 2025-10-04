import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  build: {
   
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          
          "react-vendor": ["react", "react-dom"],
        },
      },
    },
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
  },

  optimizeDeps: {
    include: ["react", "react-dom"],
  },
  
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5174", 
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
