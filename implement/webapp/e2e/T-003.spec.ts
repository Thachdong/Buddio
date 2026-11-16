import { expect, test, type Page } from '@playwright/test'
import { Timestamp } from 'firebase-admin/firestore'
import { vi } from '../src/shared/i18n/vi'
import { adminDb, uidByEmail, uniqueEmail } from './support/admin'
import { loginWithGoogleEmulator, signUpViaUi } from './support/auth'

const s = vi.account.settings
const login = vi.auth.login
const DAY = 24 * 60 * 60 * 1000
const notice = (page: Page) => page.getByRole('main').getByRole('alert')

async function ageSession(email: string, days: number) {
  const uid = await uidByEmail(email)
  const at = Timestamp.fromMillis(Date.now() - days * DAY)
  await adminDb().doc(`users/${uid}`).update({ last_active_at: at })
  return { uid, at: at.toMillis() }
}
const lastActive = async (uid: string) =>
  ((await adminDb().doc(`users/${uid}`).get()).data()!.last_active_at as Timestamp).toMillis()

test.describe('T-003 đăng xuất & hết phiên (mobile 375×812)', () => {
  test('AC-1, AC-2: Cài đặt chỉ xem → Đăng xuất → "Bạn đã đăng xuất." → /rooms bị đẩy về /login', async ({ page }) => {
    const email = uniqueEmail('an')
    await signUpViaUi(page, { email, name: 'An', photo: 'https://example.com/an.png' })

    await page.getByRole('link', { name: vi.account.tabs.settings }).click()
    await expect(page.getByRole('heading', { name: s.title })).toBeVisible()
    await expect(page.getByText(email)).toBeVisible()
    await expect(page.getByText('An', { exact: true })).toBeVisible()
    await expect(page.getByText(s.photoCaption)).toBeVisible()
    for (const label of [s.anonymous, s.showOnline]) {
      const sw = page.getByRole('switch', { name: label })
      await expect(sw).toBeChecked()
      await expect(sw).toBeDisabled()
    }
    await expect(page.getByRole('link', { name: s.privacyPolicy })).toHaveAttribute('href', '/privacy')

    await page.getByRole('button', { name: s.signOut }).click()
    await expect(page).toHaveURL(/\/login\?reason=signed_out$/)
    await expect(notice(page)).toHaveText(login.signedOut)
    await expect(page.getByRole('button', { name: login.signInWithGoogle })).toBeEnabled()

    await page.goto('/rooms')
    await expect(page).toHaveURL(/\/login$/)
  })

  test('AC-4: đăng xuất ở trình duyệt X → trình duyệt Y reload → "Phiên đăng nhập đã hết hạn…"', async ({ browser }) => {
    const email = uniqueEmail('an2')
    const x = await (await browser.newContext({ viewport: { width: 375, height: 812 } })).newPage()
    await signUpViaUi(x, { email, name: 'An' })
    const y = await (await browser.newContext({ viewport: { width: 375, height: 812 } })).newPage()
    await y.goto('/login')
    await loginWithGoogleEmulator(y, { email, existing: true })
    await expect(y).toHaveURL(/\/rooms$/)

    // thu hồi so theo giây: phiên Y phải được tạo trước mốc revoke ≥ 1 giây
    await x.waitForTimeout(1100)
    await x.goto('/settings')
    await x.getByRole('button', { name: s.signOut }).click()
    await expect(x).toHaveURL(/reason=signed_out/)

    await y.reload()
    await expect(y).toHaveURL(/\/login\?reason=expired$/)
    await expect(notice(y)).toHaveText(login.sessionExpired)
    await x.context().close()
    await y.context().close()
  })

  test('AC-5, AC-7: −31 ngày → mở app → hết phiên, last_active_at giữ nguyên → đăng nhập lại vào thẳng Phòng', async ({ page }) => {
    const email = uniqueEmail('old')
    await signUpViaUi(page, { email, name: 'Old' })
    const { uid, at } = await ageSession(email, 31)

    await page.reload()
    await expect(page).toHaveURL(/\/login\?reason=expired$/)
    await expect(notice(page)).toHaveText(login.sessionExpired)
    expect(await lastActive(uid)).toBe(at)

    // AC-7: đăng nhập lại → không dialog, last_active_at = now
    const before = Date.now() - 1000
    await loginWithGoogleEmulator(page, { email, existing: true })
    await expect(page).toHaveURL(/\/rooms$/)
    await expect(page.getByRole('dialog')).toBeHidden()
    expect(await lastActive(uid)).toBeGreaterThanOrEqual(before)
  })

  test('AC-6: −29 ngày → mở app vẫn ở Phòng, last_active_at cập nhật', async ({ page }) => {
    const email = uniqueEmail('edge')
    await signUpViaUi(page, { email, name: 'Edge' })
    const { uid, at } = await ageSession(email, 29)
    await page.reload()
    await expect(page).toHaveURL(/\/rooms$/)
    await expect(page.getByText(vi.rooms.list.emptyTitle)).toBeVisible()
    expect(await lastActive(uid)).toBeGreaterThan(at + DAY)
  })

  test('AC-8: gọi đăng xuất lỗi mạng → vẫn signOut, về SCR-01 "Bạn đã đăng xuất."', async ({ page }) => {
    const email = uniqueEmail('net')
    await signUpViaUi(page, { email, name: 'Net' })
    await page.goto('/settings')
    // giả lập mất mạng cho request Server Action (POST có header next-action)
    await page.route('**/*', (route) =>
      route.request().method() === 'POST' && route.request().headers()['next-action'] ? route.abort('internetdisconnected') : route.continue(),
    )
    await page.getByRole('button', { name: s.signOut }).click()
    await expect(page).toHaveURL(/\/login\?reason=signed_out$/)
    await expect(notice(page)).toHaveText(login.signedOut)
  })

  test('AC-9: listener users/{me} lỗi → "Không tải được" + "Thử lại"', async ({ page }) => {
    const email = uniqueEmail('err')
    await signUpViaUi(page, { email, name: 'Err' })
    await page.goto('/settings')
    await expect(page.getByText(email)).toBeVisible()
    const uid = await uidByEmail(email)
    const snapshot = (await adminDb().doc(`users/${uid}`).get()).data()!
    // listener nhận "không tồn tại" → nhánh lỗi
    await adminDb().doc(`users/${uid}`).delete()
    await expect(page.getByText(s.loadError)).toBeVisible()
    await adminDb().doc(`users/${uid}`).set(snapshot)
    await page.getByRole('button', { name: vi.common.retry }).click()
    await expect(page.getByText(email)).toBeVisible()
  })
})
