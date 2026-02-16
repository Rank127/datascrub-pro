import { defineConfig, devices } from '@playwright/test'

const port = process.env.CI ? 3000 : 3002
const baseURL = `http://localhost:${port}`

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  timeout: 30000,
  use: {
    baseURL,
    trace: 'on-first-retry',
    actionTimeout: 10000,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    command: `npx next dev --port ${port}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    env: {
      ...process.env,
      AUTH_SECRET: process.env.AUTH_SECRET || 'e2e-test-secret-not-for-production',
      DATABASE_URL: process.env.DATABASE_URL || 'postgresql://test:test@localhost:5432/test_db',
    },
  },
})
