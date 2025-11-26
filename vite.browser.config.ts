import { mkdirSync } from 'node:fs'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig, type ConfigEnv, type UserConfig } from 'vite'
import pkg from './package.json' with { type: 'json' }


export default defineConfig((env: ConfigEnv) => {
  const shared = {
    plugins: [],
    server: {
      open: false,
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
  } satisfies UserConfig

  const browserConfig = {
    ...shared,
    build: {
      lib: {
        name: pkg.name,
        entry: fileURLToPath(new URL('./src/browser/index.ts', import.meta.url)),
        fileName: (format) => {
          mkdirSync('dist/browser', { recursive: true })
          return `browser/${pkg.name}.${format}.js`
        },
        formats: ['es'],
      },
      emptyOutDir: false,
      manifest: false,
      cssCodeSplit: false,
      rollupOptions: {
        external: ["crypto"]
      }
    },

  } satisfies UserConfig

  return browserConfig
})