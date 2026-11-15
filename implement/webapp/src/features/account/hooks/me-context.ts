'use client'
import { createContext, useContext } from 'react'
import type { MeWithLimits } from '../contracts'

/** LAYOUT.A1 — me + limits từ getMe (SSR ở (tabs)/layout). Provider: account/ui/me-provider.tsx. */
export const MeContext = createContext<MeWithLimits | null>(null)

/** Dùng trong mọi màn thuộc (tabs). Throw nếu thiếu Provider (lỗi lập trình). */
export function useMe(): MeWithLimits {
  const v = useContext(MeContext)
  if (!v) throw new Error('useMe() must be used inside <MeProvider>')
  return v
}
