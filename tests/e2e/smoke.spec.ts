import { test, expect } from '@playwright/test'

test('public pages render', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('body')).toContainText('SOUQ ENGINE')

  await page.goto('/login')
  await expect(page.locator('body')).toContainText(/Welcome Back|SOUQ ENGINE/)
})
