'use client'
import { useTransition } from 'react'
import { callAction } from '@/shared/client/call-action'
import { signOutGoogle } from '../client/google-auth'
import { deleteCurrentSessionAction } from '../server/actions'

/**
 * SCR-11.A4 — Đăng xuất (không cần xác nhận). deleteCurrentSession (revoke mọi thiết bị, Q-044)
 * → signOut Firebase → /login?reason=signed_out ("Bạn đã đăng xuất.").
 * Lỗi mạng / 5xx / phiên đã thu hồi → VẪN signOut và về SCR-01 (AC-8, Q-044).
 */
export function useSignOut() {
  const [pending, startTransition] = useTransition()

  const signOut = () =>
    startTransition(async () => {
      // Kết quả không đổi luồng: đăng xuất phía client luôn diễn ra
      await callAction(() => deleteCurrentSessionAction(), { onSessionEnded: 'ignore' })
      await signOutGoogle().catch(() => {})
      // điều hướng cứng: xoá state client + RSC cache của phiên cũ
      window.location.replace('/login?reason=signed_out')
    })

  return { pending, signOut }
}
