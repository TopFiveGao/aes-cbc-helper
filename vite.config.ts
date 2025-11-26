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

  const config = {
    ...shared,
    build: {
      lib: {
        name: pkg.name,
        entry: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
        fileName: format => `${pkg.name}.${format}.js`,
        formats: ['es'],
      },
      emptyOutDir: true,
      manifest: false,
      cssCodeSplit: false,
      rollupOptions: {
        external: ["node:crypto"]
      }
    },
  } satisfies UserConfig

  return config
})