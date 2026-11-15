import { expect, type Page } from '@playwright/test'
import { vi } from '../../src/shared/i18n/vi'

/**
 * Đăng nhập Google qua màn tài khoản giả của Auth emulator (redirect ở mobile < 1024px).
 * existing = true → chọn tài khoản Google đã có trong emulator theo email; ngược lại "Add new account".
 * Kết thúc khi đã quay lại app (chưa chờ dialog hay /rooms).
 */
export async function loginWithGoogleEmulator(
  page: Page,
  user: { email: string; name?: string; photo?: string; existing?: boolean },
): Promise<void> {
  await page.getByRole('button', { name: vi.auth.login.signInWithGoogle }).click()
  await page.waitForURL(/127\.0\.0\.1:9099\/emulator\/auth\/handler/)
  if (user.existing) {
    await page.getByText(user.email).click()
  } else {
    await page.getByText(/add new account/i).click()
    await page.locator('#email-input').fill(user.email)
    await page.locator('#display-name-input').fill(user.name ?? '')
    if (user.photo) await page.locator('#profile-photo-input').fill(user.photo)
    await page.locator('#sign-in').click()
  }
  await page.waitForURL(/localhost:3000/)
}

export async function expectNoHorizontalScroll(page: Page) {
  const { scroll, client } = await page.evaluate(() => ({
    scroll: document.documentElement.scrollWidth,
    client: document.documentElement.clientWidth,
  }))
  expect(scroll).toBeLessThanOrEqual(client)
}
