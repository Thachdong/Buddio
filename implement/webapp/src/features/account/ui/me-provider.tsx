'use client'
import type { ReactNode } from 'react'
import type { MeWithLimits } from '../contracts'
import { MeContext } from '../hooks/me-context'

/** LAYOUT.A1 — giữ me + limits (từ getMe SSR) cho mọi màn trong (tabs). Đọc bằng useMe(). */
export function MeProvider({ value, children }: { value: MeWithLimits; children: ReactNode }) {
  return <MeContext.Provider value={value}>{children}</MeContext.Provider>
}
