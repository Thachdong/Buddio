'use client'
import { useEffect, useState } from 'react'
import { useAuthUser } from '@/shared/client/auth'
import type { MySettings } from '../contracts'
import { subscribeMySettings } from '../client/my-settings.listener'
import { useMe } from './me-context'

export type MySettingsState =
  | { status: 'loading' }
  | { status: 'ready'; settings: MySettings }
  | { status: 'error' }

/**
 * SCR-11.A0 — hồ sơ & cài đặt. Khởi tạo từ getMe (SSR, MeProvider) rồi listener users/{me} + profiles/{me}
 * tiếp quản. Listener lỗi → error ("Không tải được" + "Thử lại"); retry() đăng ký lại.
 */
export function useMySettings(): { state: MySettingsState; retry: () => void } {
  const { me } = useMe()
  const user = useAuthUser()
  const [attempt, setAttempt] = useState(0)
  const [state, setState] = useState<MySettingsState>({
    status: 'ready',
    settings: {
      email: me.email,
      displayName: me.displayName,
      photoUrl: me.photoUrl ?? null,
      anonymous: me.anonymous,
      showOnline: me.showOnline,
    },
  })

  useEffect(() => {
    if (!user) return
    return subscribeMySettings(
      user.uid,
      (settings) => setState({ status: 'ready', settings }),
      () => setState({ status: 'error' }),
    )
  }, [user, attempt])

  const retry = () => {
    setState({ status: 'loading' })
    setAttempt((n) => n + 1)
  }
  return { state, retry }
}
