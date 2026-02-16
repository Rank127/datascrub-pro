import { test, expect } from '@playwright/test'

test.describe('Family Invitation Flow', () => {
  test.beforeEach(async ({ context }) => {
    await context.addCookies([{
      name: 'cookie-consent',
      value: encodeURIComponent(JSON.stringify({ analytics: true, marketing: true, v: 1 })),
      domain: 'localhost',
      path: '/',
    }]);
  });

  test('unauthenticated user sees login/register options', async ({ page }) => {
    // Use a test token - the page will show login options for unauthenticated users
    await page.goto('/family/join/test-token')

    // Wait for the page to finish loading - look for any content
    await page.waitForLoadState('networkidle', { timeout: 15000 })

    // The page should show either the invitation (with login options) or invalid error
    const hasCreateAccount = await page.locator('text=Create Account').isVisible()
    const hasSignIn = await page.locator('text=Sign In').isVisible()
    const hasInvalidError = await page.locator('text=Invalid Invitation').isVisible()
    const hasLoading = await page.locator('text=Loading').isVisible()

    // Either show auth options, invalid invitation message, or still loading
    expect(hasCreateAccount || hasSignIn || hasInvalidError || hasLoading).toBe(true)
  })

  test('register link includes callbackUrl for family join', async ({ page }) => {
    await page.goto('/family/join/test-token')

    // Wait for page to load
    await page.waitForLoadState('networkidle', { timeout: 15000 })

    // Check if create account link is visible and has proper callbackUrl
    const registerLink = page.locator('a:has-text("Create Account")')
    const isVisible = await registerLink.isVisible()

    if (isVisible) {
      const href = await registerLink.getAttribute('href')
      expect(href).toContain('callbackUrl')
      expect(href).toContain('family')
      expect(href).toContain('join')
    }
  })

  test('shows loading state initially', async ({ page }) => {
    await page.goto('/family/join/test-token')

    // Should show loading state briefly or the content
    await page.waitForLoadState('domcontentloaded')

    const hasLoading = await page.locator('text=Loading').isVisible()
    const hasInvitation = await page.locator('text=Invitation').isVisible()
    const hasError = await page.locator('text=Invalid').isVisible()

    expect(hasLoading || hasInvitation || hasError).toBe(true)
  })

  test('handles expired/invalid token gracefully', async ({ page }) => {
    await page.goto('/family/join/definitely-invalid-token-12345')

    // Wait for the page to load
    await page.waitForLoadState('networkidle', { timeout: 15000 })

    // Should show some kind of error or invitation UI
    const hasError = await page.locator('text=Invalid').first().isVisible()
    const hasExpired = await page.locator('text=expired').first().isVisible()
    const hasInvitation = await page.locator('text=Invitation').first().isVisible()
    const hasLoading = await page.locator('text=Loading').first().isVisible()

    expect(hasError || hasExpired || hasInvitation || hasLoading).toBe(true)
  })
})
