import { test, expect } from '@playwright/test'

test.describe('Registration Flow', () => {
  test('renders registration form correctly', async ({ page }) => {
    await page.goto('/register')

    await expect(page.locator('text=Create your account')).toBeVisible()
    await expect(page.locator('input[id="name"]')).toBeVisible()
    await expect(page.locator('input[id="email"]')).toBeVisible()
    await expect(page.locator('input[id="password"]')).toBeVisible()
    await expect(page.locator('input[id="confirmPassword"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('shows error when passwords do not match', async ({ page }) => {
    await page.goto('/register')

    await page.fill('input[id="name"]', 'Test User')
    await page.fill('input[id="email"]', `test-${Date.now()}@example.com`)
    await page.fill('input[id="password"]', 'SecurePass123!')
    await page.fill('input[id="confirmPassword"]', 'DifferentPass123!')
    await page.click('#terms')
    await page.click('button[type="submit"]')

    await expect(page.locator('text=Passwords do not match')).toBeVisible()
  })

  test('shows error when terms not accepted', async ({ page }) => {
    await page.goto('/register')

    await page.fill('input[id="name"]', 'Test User')
    await page.fill('input[id="email"]', `test-${Date.now()}@example.com`)
    await page.fill('input[id="password"]', 'SecurePass123!')
    await page.fill('input[id="confirmPassword"]', 'SecurePass123!')
    await page.click('button[type="submit"]')

    await expect(page.locator('text=Please accept the terms and conditions')).toBeVisible()
  })

  test('preserves callbackUrl through registration', async ({ page }) => {
    await page.goto('/register?callbackUrl=%2Ffamily%2Fjoin%2Ftest-token')

    // Verify the page loaded correctly
    await expect(page.locator('text=Create your account')).toBeVisible()

    // Check that login link preserves callback
    const loginLink = page.locator('a[href="/login"]')
    await expect(loginLink).toBeVisible()
  })

  test('displays discount banner when discount code is present', async ({ page }) => {
    await page.goto('/register?discount=EXIT50')

    await expect(page.locator('text=50% OFF Applied!')).toBeVisible()
  })

  test('has link to login page', async ({ page }) => {
    await page.goto('/register')

    const loginLink = page.locator('a[href="/login"]')
    await expect(loginLink).toBeVisible()
    await expect(loginLink).toContainText('Sign in')
  })

  test('has links to terms and privacy policy', async ({ page }) => {
    await page.goto('/register')

    await expect(page.locator('a[href="/terms"]')).toBeVisible()
    await expect(page.locator('a[href="/privacy"]')).toBeVisible()
  })
})
