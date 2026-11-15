import { readFileSync } from 'node:fs'
import { defineConfig, devices } from '@playwright/test'

const baseURL = 'http://localhost:3000'

/** Biến emulator cho `next dev` (CI không có .env.local): đọc .env.example — chỉ giá trị demo, không có secret. */
const exampleEnv = Object.fromEntries(
  readFileSync('.env.example', 'utf8')
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('#') && l.includes('='))
    .map((l) => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1)]),
)

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: { baseURL, trace: 'retain-on-failure' },
  projects: [
    {
      name: 'mobile',
      use: { ...devices['Desktop Chrome'], viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: `${baseURL}/api/health`,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    env: { ...exampleEnv, ...(process.env as Record<string, string>) },
  },
})
