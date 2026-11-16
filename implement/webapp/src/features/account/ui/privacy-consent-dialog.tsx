'use client'
import { Loader2Icon } from 'lucide-react'
import { vi } from '@/shared/i18n/vi'
import { Button } from '@/shared/ui/button'
import { Checkbox } from '@/shared/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'
import type { MeWithLimits } from '../contracts'
import { usePrivacyConsent } from '../hooks/use-privacy-consent'
import { PrivacyPolicyContent } from './privacy-policy-content'

const t = vi.account.consent

/**
 * SCR-01 thành phần 7–10. Không đóng bằng chạm ra ngoài / Esc, không có nút X.
 * Mount khi cần hiện (key theo phiên) để checkbox luôn bắt đầu ở trạng thái chưa tích.
 */
export function PrivacyConsentDialog({
  policyVersion,
  onAccepted,
  onDeclined,
  onToast,
}: {
  policyVersion: string
  onAccepted: (data: MeWithLimits) => void
  onDeclined: () => void
  onToast: (message: string) => void
}) {
  const consent = usePrivacyConsent({ policyVersion, onAccepted, onToast })
  const block = (e: Event) => e.preventDefault()

  return (
    <Dialog open>
      <DialogContent
        showCloseButton={false}
        onPointerDownOutside={block}
        onInteractOutside={block}
        onEscapeKeyDown={block}
        className="flex max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-[400px] flex-col gap-4"
      >
        <DialogHeader>
          <DialogTitle>{t.title}</DialogTitle>
          <DialogDescription>{t.description}</DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto rounded-md border border-border p-3">
          <PrivacyPolicyContent headingLevel="h3" />
        </div>

        <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm">
          <Checkbox
            checked={consent.agreed}
            onCheckedChange={(v) => consent.setAgreed(v === true)}
            disabled={consent.pending}
          />
          <span>{t.checkbox}</span>
        </label>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button
            type="button"
            size="lg"
            className="h-11 w-full"
            disabled={!consent.canAccept}
            aria-busy={consent.pending}
            onClick={consent.accept}
          >
            {consent.pending && <Loader2Icon className="animate-spin" aria-hidden />}
            {t.accept}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="lg"
            className="h-11 w-full"
            disabled={consent.pending}
            onClick={onDeclined}
          >
            {t.decline}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
