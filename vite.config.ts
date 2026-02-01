import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    // Production optimizations
    target: 'es2015',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        // Manual chunking for better code splitting
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-hook-form'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-select'],
          'stripe': ['@stripe/stripe-js', '@stripe/react-stripe-js'],
          'query': ['@tanstack/react-query'],
          'router': ['wouter'],
          'date': ['date-fns'],
          'icons': ['lucide-react'],
        },
      },
    },
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
    // Source maps for debugging (disable in production for smaller builds)
    sourcemap: false,
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
