import { expect, test } from '@playwright/test'
import { vi } from '../src/shared/i18n/vi'

test.describe('T-001 smoke (mobile 375×812)', () => {
  test('AC-1: mở / → chuyển /login, thấy màn Đăng nhập, không tràn ngang', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL(/\/login$/)
    await expect(page.getByRole('heading', { name: vi.app.name })).toBeVisible()
    await expect(page.getByText(vi.auth.login.tagline)).toBeVisible()
    await expect(page.getByRole('button', { name: vi.auth.login.signInWithGoogle })).toBeVisible()
    await expect(page.getByRole('link', { name: vi.auth.login.privacyPolicy })).toHaveAttribute('href', '/privacy')
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth)
    expect(scrollWidth).toBeLessThanOrEqual(375)
  })

  test('AC-2: GET /api/health không kèm Authorization → 200 {"status":"ok"}', async ({ request }) => {
    const res = await request.get('/api/health')
    expect(res.status()).toBe(200)
    expect(await res.json()).toEqual({ status: 'ok' })
  })
})
