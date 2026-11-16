'use client'
import { useEffect, useRef } from 'react'
import { isIntentionalSignOut, useAuthUser } from '@/shared/client/auth'
import { endSessionOnClient } from '@/shared/client/call-action'

/**
 * T-003 — Firebase Auth về null giữa phiên mà không do app chủ động (refresh token bị thu hồi ở thiết bị khác,
 * dữ liệu đăng nhập trình duyệt bị xoá) → /login?reason=expired. Gắn ở layout (tabs)/(full).
 */
export function useSessionWatcher(): void {
  const user = useAuthUser()
  const handled = useRef(false)
  useEffect(() => {
    if (user !== null || handled.current || isIntentionalSignOut()) return
    handled.current = true
    void endSessionOnClient()
  }, [user])
}
