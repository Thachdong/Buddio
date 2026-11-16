import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const signOutClient = vi.fn(async () => {})
vi.mock('./auth', () => ({ signOutClient }))

const replace = vi.fn()
beforeEach(() => {
  vi.stubGlobal('window', { location: { replace } })
})
afterEach(() => {
  vi.unstubAllGlobals()
  signOutClient.mockClear()
  replace.mockClear()
})

const fail = (code: string) => async () => ({ ok: false as const, error: { code: code as never, message: 'x' } })

describe('callAction — phiên kết thúc (T-003)', () => {
  it.each(['SESSION_EXPIRED', 'TOKEN_REVOKED'])('AC-4, AC-5: %s → signOut + /login?reason=expired', async (code) => {
    const { callAction } = await import('./call-action')
    const r = await callAction(fail(code))
    expect(r.ok).toBe(false)
    expect(signOutClient).toHaveBeenCalledOnce()
    expect(replace).toHaveBeenCalledWith('/login?reason=expired')
  })

  it("onSessionEnded: 'ignore' → không tự điều hướng", async () => {
    const { callAction } = await import('./call-action')
    await callAction(fail('TOKEN_REVOKED'), { onSessionEnded: 'ignore' })
    expect(signOutClient).not.toHaveBeenCalled()
    expect(replace).not.toHaveBeenCalled()
  })

  it('mã khác (UNAUTHENTICATED, nghiệp vụ) → không điều hướng', async () => {
    const { callAction } = await import('./call-action')
    await callAction(fail('UNAUTHENTICATED'))
    await callAction(fail('INTERNAL_ERROR'))
    expect(replace).not.toHaveBeenCalled()
  })

  it('lỗi mạng → NETWORK_ERROR, không throw', async () => {
    const { callAction } = await import('./call-action')
    const r = await callAction(async () => {
      throw new TypeError('Failed to fetch')
    })
    expect(r).toMatchObject({ ok: false, error: { code: 'NETWORK_ERROR' } })
  })
})
