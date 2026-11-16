'use client'
import { useState, useTransition } from 'react'
import { callAction } from '@/shared/client/call-action'
import { vi } from '@/shared/i18n/vi'
import { AccountCreateSchema, type MeWithLimits } from '../contracts'
import { createAccountAction } from '../server/actions'

/**
 * SCR-01.A2 — dialog đồng ý chính sách. Checkbox mặc định chưa tích; nút "Đồng ý và tiếp tục"
 * chỉ bật khi đã tích. Lỗi → giữ dialog, toast, cho bấm lại.
 */
export function usePrivacyConsent(opts: {
  policyVersion: string
  onAccepted: (data: MeWithLimits) => void
  onToast: (message: string) => void
}) {
  const [agreed, setAgreed] = useState(false)
  const [pending, startTransition] = useTransition()

  const accept = () => {
    const parsed = AccountCreateSchema.safeParse({ acceptPrivacyPolicy: agreed, policyVersion: opts.policyVersion })
    if (!parsed.success) return
    startTransition(async () => {
      const r = await callAction(() => createAccountAction(parsed.data))
      if (r.ok) return opts.onAccepted(r.data)
      switch (r.error.code) {
        case 'NETWORK_ERROR':
        case 'INTERNAL_ERROR':
          return opts.onToast(vi.common.networkError)
        case 'STALE_DEPLOY':
          return opts.onToast(vi.common.staleDeploy)
        default:
          return opts.onToast(r.error.message)
      }
    })
  }

  return { agreed, setAgreed, pending, canAccept: agreed && !pending, accept }
}
