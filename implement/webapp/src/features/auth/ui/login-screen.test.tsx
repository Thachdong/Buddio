import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi as vitest } from 'vitest'
import { vi } from '@/shared/i18n/vi'
import { LoginScreen } from './login-screen'

// Render tĩnh: hook điều phối đăng nhập cần App Router + Firebase → thay bằng trạng thái idle
vitest.mock('../hooks/use-google-sign-in', () => ({
  useGoogleSignIn: () => ({
    state: { kind: 'idle' },
    error: null,
    signIn: () => {},
    declineConsent: () => {},
    consentAccepted: () => {},
  }),
}))
vitest.mock('@/features/account/ui/privacy-consent-dialog', () => ({ PrivacyConsentDialog: () => null }))

/** Ký tự Latin có dấu (gồm toàn bộ chữ tiếng Việt). */
const VIETNAMESE = /[À-ỹ]/

const tsxFiles = (dir: string): string[] =>
  readdirSync(dir).flatMap((name) => {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) return tsxFiles(p)
    return p.endsWith('.tsx') && !p.endsWith('.test.tsx') ? [p] : []
  })

const stripComments = (src: string) => src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1')

describe('SCR-01 /login — từ điển (NFR-24)', () => {
  it('AC-5: không có chuỗi tiếng Việt hard-code trong component của /login', () => {
    const files = [
      ...tsxFiles('src/app'),
      ...tsxFiles('src/features/auth/ui'),
      ...tsxFiles('src/features/account/ui'),
      ...tsxFiles('src/features/rooms/ui'),
    ]
    expect(files.length).toBeGreaterThan(0)
    const offenders = files.flatMap((f) =>
      stripComments(readFileSync(f, 'utf8'))
        .split('\n')
        .map((line, i) => ({ f, n: i + 1, line }))
        .filter(({ line }) => VIETNAMESE.test(line)),
    )
    expect(offenders).toEqual([])
  })

  it('AC-5: mọi chữ hiển thị lấy từ vi', () => {
    const html = renderToStaticMarkup(<LoginScreen />)
    const visible = html
      .replace(/<[^>]+>/g, '\n')
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean)
    const dictionary = new Set<string>(Object.values(vi.auth.login))
    expect(visible).toEqual(
      expect.arrayContaining([vi.auth.login.tagline, vi.auth.login.signInWithGoogle, vi.auth.login.privacyPolicy]),
    )
    for (const text of visible) expect(dictionary).toContain(text)
    // logo (ảnh có chữ) — tên app nằm ở alt, cũng lấy từ vi
    const alts = [...html.matchAll(/alt="([^"]*)"/g)].map((m) => m[1])
    expect(alts).toEqual([vi.app.name])
  })
})
