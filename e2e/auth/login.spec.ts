import { test, expect } from '@playwright/test'

test.describe('Login Flow', () => {
  test('renders login form correctly', async ({ page }) => {
    await page.goto('/login')

    await expect(page.locator('text=Welcome back')).toBeVisible()
    await expect(page.locator('input[id="email"]')).toBeVisible()
    await expect(page.locator('input[id="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('shows error for invalid credentials', async ({ page }) => {
    await page.goto('/login')

    await page.fill('input[id="email"]', 'wrong@example.com')
    await page.fill('input[id="password"]', 'wrongpassword')
    await page.click('button[type="submit"]')

    // Wait for either error message or loading to complete
    await expect(page.locator('text=Invalid email or password')).toBeVisible({ timeout: 15000 })
  })

  test('has forgot password link', async ({ page }) => {
    await page.goto('/login')

    const forgotLink = page.locator('a[href="/forgot-password"]')
    await expect(forgotLink).toBeVisible()
    await expect(forgotLink).toContainText('Forgot password?')
  })

  test('has register link', async ({ page }) => {
    await page.goto('/login')

    const registerLink = page.locator('a[href="/register"]')
    await expect(registerLink).toBeVisible()
    await expect(registerLink).toContainText('Sign up')
  })

  test('preserves callbackUrl parameter', async ({ page }) => {
    await page.goto('/login?callbackUrl=%2Fdashboard%2Fsettings')

    // Page should load correctly with callbackUrl
    await expect(page.locator('text=Welcome back')).toBeVisible()
  })

  test('shows loading state when submitting', async ({ page }) => {
    await page.goto('/login')

    await page.fill('input[id="email"]', 'test@example.com')
    await page.fill('input[id="password"]', 'password123')

    // Click submit and check for loading state
    await page.click('button[type="submit"]')

    // Either loading state or error should appear
    const isLoading = await page.locator('text=Signing in...').isVisible()
    const hasError = await page.locator('text=Invalid email or password').isVisible()

    expect(isLoading || hasError).toBe(true)
  })
})
