'use client'
import { useCallback, useEffect, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { callAction } from '@/shared/client/call-action'
import { vi } from '@/shared/i18n/vi'
import type { GoogleProfile } from '../contracts'
import {
  consumeRedirectResult,
  getCurrentIdToken,
  GoogleSignInError,
  signInWithGoogle,
  signOutGoogle,
} from '../client/google-auth'
import { createSessionAction } from '../server/actions'

const t = vi.auth.login

/** UI switch trên `kind`. */
export type SignInState =
  | { kind: 'checking' } // khi mount: đọc kết quả redirect / Firebase user còn đăng nhập
  | { kind: 'idle' }
  | { kind: 'signing-in' }
  | { kind: 'consent'; googleProfile: GoogleProfile; policyVersion: string }
  | { kind: 'redirecting' }

const HOME = '/rooms'

/**
 * SCR-01.A1 + điều phối dialog chính sách (SCR-01.A2 ở account/hooks/use-privacy-consent).
 * - Mount: kết quả redirect (điện thoại) hoặc Firebase user còn đăng nhập (reload giữa chừng, layout trả
 *   CONSENT_REQUIRED, cookie hết hạn) → gọi lại createSession [ASSUMED → Q-047].
 * - active → /rooms · consent_required → mở dialog · huỷ/lỗi Google → vùng lỗi (E1) · mạng/5xx → toast.
 */
export function useGoogleSignIn(onToast: (message: string) => void) {
  const router = useRouter()
  const [state, setState] = useState<SignInState>({ kind: 'checking' })
  const [error, setError] = useState<string | null>(null)
  const [, startTransition] = useTransition()
  const toastRef = useRef(onToast)
  useEffect(() => {
    toastRef.current = onToast
  }, [onToast])

  const startSession = useCallback(
    async (idToken: string) => {
      const r = await callAction(() => createSessionAction({ idToken }))
      if (r.ok) {
        if (r.data.accountStatus === 'active') {
          setState({ kind: 'redirecting' })
          startTransition(() => router.replace(HOME))
          return
        }
        setState({ kind: 'consent', googleProfile: r.data.googleProfile, policyVersion: r.data.policyVersion })
        return
      }
      setState({ kind: 'idle' })
      switch (r.error.code) {
        case 'UNAUTHENTICATED':
        case 'TOKEN_REVOKED':
          setError(t.signInIncomplete)
          return
        case 'NETWORK_ERROR':
        case 'INTERNAL_ERROR':
          toastRef.current(vi.common.networkError)
          return
        case 'STALE_DEPLOY':
          toastRef.current(vi.common.staleDeploy)
          return
        default:
          toastRef.current(r.error.message)
      }
    },
    [router],
  )

  const handleGoogleError = useCallback((err: unknown) => {
    setState({ kind: 'idle' })
    if (err instanceof GoogleSignInError && err.code === 'NETWORK_ERROR') toastRef.current(vi.common.networkError)
    else setError(t.signInIncomplete)
  }, [])

  // Mount: redirect result → Firebase user hiện có → idle
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const token = (await consumeRedirectResult()) ?? (await getCurrentIdToken())
        if (cancelled) return
        if (token) await startSession(token)
        else setState({ kind: 'idle' })
      } catch (err) {
        if (!cancelled) handleGoogleError(err)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [startSession, handleGoogleError])

  const signIn = useCallback(async () => {
    setError(null)
    setState({ kind: 'signing-in' })
    try {
      const token = await signInWithGoogle()
      if (token) await startSession(token) // redirect: trang rời đi, kết quả xử lý khi mount lại
    } catch (err) {
      handleGoogleError(err)
    }
  }, [startSession, handleGoogleError])

  /** Nút "Không đồng ý": signOut, đóng dialog, ở lại SCR-01, không tạo gì. */
  const declineConsent = useCallback(async () => {
    try {
      await signOutGoogle()
    } finally {
      setState({ kind: 'idle' })
    }
  }, [])

  /** createAccount thành công → điều hướng như A1. */
  const consentAccepted = useCallback(() => {
    setState({ kind: 'redirecting' })
    startTransition(() => router.replace(HOME))
  }, [router])

  return { state, error, signIn, declineConsent, consentAccepted }
}
