import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

const src = fileURLToPath(new URL('./src', import.meta.url))
const empty = fileURLToPath(new URL('./src/test/empty.ts', import.meta.url))

export default defineConfig({
  resolve: {
    alias: [
      { find: /^@\//, replacement: `${src}/` },
      { find: /^server-only$/, replacement: empty },
      { find: /^client-only$/, replacement: empty },
    ],
  },
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          environment: 'node',
          include: ['src/**/*.test.{ts,tsx}'],
          exclude: ['**/*.emu.test.{ts,tsx}', 'node_modules/**'],
        },
      },
      {
        extends: true,
        test: {
          // chạy trong `firebase emulators:exec` (biến *_EMULATOR_HOST do CLI đặt)
          name: 'emulator',
          environment: 'node',
          include: ['src/**/*.emu.test.{ts,tsx}', 'firebase/tests/**/*.test.ts'],
          pool: 'forks',
          fileParallelism: false,
          testTimeout: 20_000,
          hookTimeout: 30_000,
        },
      },
    ],
  },
})
