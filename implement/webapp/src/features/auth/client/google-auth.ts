import 'client-only'
import {
  getRedirectResult,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  type User,
} from 'firebase/auth'
import { clientAuth } from '@/shared/client/firebase'

/** Lỗi sign-in phía Google, đã gộp cho UI (FLOW-01 E1). */
export type GoogleSignInErrorCode = 'SIGN_IN_CANCELLED' | 'NETWORK_ERROR'

export class GoogleSignInError extends Error {
  constructor(readonly code: GoogleSignInErrorCode, cause?: unknown) {
    super(code, { cause })
    this.name = 'GoogleSignInError'
  }
}

const DESKTOP_QUERY = '(min-width: 1024px)' // ADR-06: popup desktop, redirect điện thoại [ASSUMED → Q-047]

function toSignInError(err: unknown): GoogleSignInError {
  const code = (err as { code?: string })?.code ?? ''
  if (code === 'auth/network-request-failed') return new GoogleSignInError('NETWORK_ERROR', err)
  // popup-closed-by-user, cancelled-popup-request, popup-blocked, user-cancelled, lỗi redirect…
  return new GoogleSignInError('SIGN_IN_CANCELLED', err)
}

const provider = () => {
  const p = new GoogleAuthProvider()
  p.setCustomParameters({ prompt: 'select_account' })
  return p
}

/**
 * SCR-01.A1. Desktop (≥1024px) → popup, trả ID token. Điện thoại → redirect, trang rời đi,
 * trả `null`; kết quả lấy lại bằng `consumeRedirectResult()` khi trang tải lại.
 */
export async function signInWithGoogle(): Promise<string | null> {
  const auth = clientAuth()
  try {
    if (window.matchMedia(DESKTOP_QUERY).matches) {
      const cred = await signInWithPopup(auth, provider())
      return await cred.user.getIdToken()
    }
    await signInWithRedirect(auth, provider())
    return null
  } catch (err) {
    throw toSignInError(err)
  }
}

/** Gọi khi mount màn đăng nhập: có kết quả redirect → ID token; không có → null. Lỗi redirect → GoogleSignInError. */
export async function consumeRedirectResult(): Promise<string | null> {
  try {
    const cred = await getRedirectResult(clientAuth())
    return cred ? await cred.user.getIdToken() : null
  } catch (err) {
    throw toSignInError(err)
  }
}

/** Firebase user hiện tại (sau khi Auth khôi phục xong), lấy ID token mới. Không đăng nhập → null. */
export async function getCurrentIdToken(): Promise<string | null> {
  const auth = clientAuth()
  await auth.authStateReady()
  const user: User | null = auth.currentUser
  return user ? await user.getIdToken(true) : null
}

/** "Không đồng ý" (SCR-01 nút 10) — signOut Firebase ở trình duyệt. */
export async function signOutGoogle(): Promise<void> {
  await signOut(clientAuth())
}
