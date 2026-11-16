'use client'
import { useSessionWatcher } from '../hooks/use-session-watcher'

/** Không render gì — theo dõi Firebase Auth mất phiên giữa chừng (T-003). Đặt ở layout cần đăng nhập. */
export function SessionWatcher() {
  useSessionWatcher()
  return null
}
