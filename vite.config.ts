import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import viteTsConfigPaths from 'vite-tsconfig-paths'
import { fileURLToPath, URL } from 'url'

import tailwindcss from '@tailwindcss/vite'
import { nitro } from 'nitro/vite'
import neon from './neon-vite-plugin.ts'

const config = defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    rollupOptions: {
      // Externalize Node.js-only packages from client bundle
      external: (id) => {
        // Only externalize these during client build
        const nodeOnlyPackages = ['google-auth-library', 'gaxios', 'gcp-metadata', 'gtoken', 'node-fetch'];
        return nodeOnlyPackages.some(pkg => id === pkg || id.startsWith(`${pkg}/`));
      },
    },
  },
  plugins: [
    devtools(),
    nitro(),
    neon,
    // this is the plugin that enables path aliases
    viteTsConfigPaths({
      projects: ['./tsconfig.json'],
    }),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
  ],
})

export default config
