import { expect, test } from '@playwright/test'
import type { Timestamp } from 'firebase-admin/firestore'
import { vi } from '../src/shared/i18n/vi'
import { adminDb, uidByEmail, uniqueEmail } from './support/admin'
import { expectNoHorizontalScroll, loginWithGoogleEmulator } from './support/auth'

const c = vi.account.consent
const tabs = vi.account.tabs

const dialog = (page: import('@playwright/test').Page) => page.getByRole('dialog', { name: c.title })

test.describe('T-002 đăng nhập Google lần đầu & đồng ý chính sách (mobile 375×812)', () => {
  test('AC-1, AC-2, AC-17, AC-19: lần đầu → dialog → đồng ý → trang Phòng rỗng + 4 tab', async ({ page }) => {
    const email = uniqueEmail('binh')
    await page.goto('/login')
    await loginWithGoogleEmulator(page, { email, name: 'Bình Trần', photo: 'https://example.com/binh.png' })

    // AC-1: consent_required → dialog, nút disabled, chưa có document nào
    await expect(dialog(page)).toBeVisible()
    const accept = page.getByRole('button', { name: c.accept })
    await expect(accept).toBeDisabled()
    await expect(page.getByRole('checkbox')).not.toBeChecked()
    const uid = await uidByEmail(email)
    expect((await adminDb().doc(`users/${uid}`).get()).exists).toBe(false)
    expect((await adminDb().doc(`profiles/${uid}`).get()).exists).toBe(false)
    expect((await adminDb().doc(`email_index/${email}`).get()).exists).toBe(false)

    // AC-19: dialog trọn trong khung, nút trong vùng nhìn thấy, không cuộn ngang
    await expect(accept).toBeInViewport()
    await expect(page.getByRole('button', { name: c.decline })).toBeInViewport()
    await expectNoHorizontalScroll(page)

    // AC-2: tích → đồng ý → /rooms
    await page.getByRole('checkbox').click()
    await expect(accept).toBeEnabled()
    await accept.click()
    await expect(page).toHaveURL(/\/rooms$/)
    await expect(page.getByText(vi.rooms.list.emptyTitle)).toBeVisible()
    const nav = page.getByRole('navigation', { name: tabs.label })
    for (const label of [tabs.rooms, tabs.friends, tabs.notifications, tabs.settings]) {
      await expect(nav.getByRole('link', { name: label })).toBeVisible()
    }
    await expect(nav.getByRole('link', { name: tabs.rooms })).toHaveAttribute('aria-current', 'page')
    await expectNoHorizontalScroll(page)

    const u = (await adminDb().doc(`users/${uid}`).get()).data()!
    expect(u).toMatchObject({ anonymous: true, show_online: true, status: 'active' })
    expect(u.consent_at).toBeTruthy()
    const p = (await adminDb().doc(`profiles/${uid}`).get()).data()!
    expect(p).toMatchObject({ display_name: 'Bình Trần', photo_url: 'https://example.com/binh.png' })
    expect((await adminDb().doc(`email_index/${email}`).get()).data()!.uid).toBe(uid)

    // reload → vẫn ở trang Phòng
    await page.reload()
    await expect(page).toHaveURL(/\/rooms$/)
    await expect(page.getByText(vi.rooms.list.emptyTitle)).toBeVisible()

    // AC-17: mở /login khi đã có phiên + tài khoản → thẳng trang Phòng
    await page.goto('/login')
    await expect(page).toHaveURL(/\/rooms$/)
  })

  test('AC-3: "Không đồng ý" → đóng dialog, ở lại /login, signOut, không tạo document', async ({ page }) => {
    const email = uniqueEmail('khach')
    await page.goto('/login')
    await loginWithGoogleEmulator(page, { email, name: 'Khách' })
    await expect(dialog(page)).toBeVisible()
    await page.getByRole('button', { name: c.decline }).click()

    await expect(dialog(page)).toBeHidden()
    await expect(page).toHaveURL(/\/login$/)
    await expect(page.getByRole('button', { name: vi.auth.login.signInWithGoogle })).toBeEnabled()
    const uid = await uidByEmail(email)
    expect((await adminDb().doc(`users/${uid}`).get()).exists).toBe(false)
    expect((await adminDb().doc(`profiles/${uid}`).get()).exists).toBe(false)

    // đã signOut Firebase: tải lại không tự mở lại dialog
    await page.reload()
    await expect(page.getByRole('button', { name: vi.auth.login.signInWithGoogle })).toBeEnabled()
    await expect(dialog(page)).toBeHidden()
  })

  test('AC-4: đăng nhập lại → không dialog, vào thẳng Phòng; ảnh theo Google, tên tự sửa giữ nguyên', async ({ browser }) => {
    const email = uniqueEmail('an')
    const photo = 'https://example.com/an-google.png'

    // Lần 1: tạo tài khoản
    const ctx1 = await browser.newContext({ viewport: { width: 375, height: 812 } })
    const p1 = await ctx1.newPage()
    await p1.goto('/login')
    await loginWithGoogleEmulator(p1, { email, name: 'An', photo })
    await p1.getByRole('checkbox').click()
    await p1.getByRole('button', { name: c.accept }).click()
    await expect(p1).toHaveURL(/\/rooms$/)
    await ctx1.close()

    // Người dùng đã tự đổi tên; ảnh trong profiles cũ; last_active_at lùi 2 giờ
    const uid = await uidByEmail(email)
    const { Timestamp: Ts } = await import('firebase-admin/firestore')
    await adminDb().doc(`profiles/${uid}`).update({ display_name: 'An Gamer', display_name_custom: true, photo_url: 'https://example.com/old.png' })
    const twoHoursAgo = Ts.fromMillis(Date.now() - 2 * 3600_000)
    await adminDb().doc(`users/${uid}`).update({ last_active_at: twoHoursAgo })

    // Lần 2: trình duyệt mới, chọn tài khoản Google đã có
    const ctx2 = await browser.newContext({ viewport: { width: 375, height: 812 } })
    const p2 = await ctx2.newPage()
    await p2.goto('/login')
    await loginWithGoogleEmulator(p2, { email, existing: true })
    await expect(p2).toHaveURL(/\/rooms$/)
    await expect(dialog(p2)).toBeHidden()

    const p = (await adminDb().doc(`profiles/${uid}`).get()).data()!
    expect(p.photo_url).toBe(photo)
    expect(p.display_name).toBe('An Gamer')
    const last = (await adminDb().doc(`users/${uid}`).get()).data()!.last_active_at as Timestamp
    expect(last.toMillis()).toBeGreaterThan(twoHoursAgo.toMillis())
    await ctx2.close()
  })

  test('AC-6: desktop — đóng popup Google → "Đăng nhập chưa hoàn tất…", không tạo document', async ({ browser }) => {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } })
    const page = await ctx.newPage()
    await page.goto('/login')
    const popupPromise = page.waitForEvent('popup')
    await page.getByRole('button', { name: vi.auth.login.signInWithGoogle }).click()
    const popup = await popupPromise
    await popup.waitForLoadState()
    await popup.close()
    await expect(page.getByRole('main').getByRole('alert')).toHaveText(vi.auth.login.signInIncomplete, { timeout: 20_000 })
    await expect(page).toHaveURL(/\/login$/)
    await ctx.close()
  })
})
