import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
      generatedRouteTree: './src/route-tree.gen.ts',
      routesDirectory: './src/pages',
      routeToken: 'layout',
    }),
    react()],
    resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
