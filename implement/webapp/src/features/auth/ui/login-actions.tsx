'use client'
import { Loader2Icon } from 'lucide-react'
import { toast } from 'sonner'
import { PrivacyConsentDialog } from '@/features/account/ui/privacy-consent-dialog'
import { vi } from '@/shared/i18n/vi'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { useGoogleSignIn } from '../hooks/use-google-sign-in'

const t = vi.auth.login

/** SCR-01 thành phần 4 (nút Google), 5 (vùng thông báo: lỗi / đã đăng xuất / hết phiên), 7–10 (dialog chính sách). */
export function LoginActions() {
  const { state, message, signIn, declineConsent, consentAccepted } = useGoogleSignIn(toast.error)

  let busy: boolean
  switch (state.kind) {
    case 'checking':
    case 'signing-in':
    case 'redirecting':
      busy = true
      break
    case 'idle':
    case 'consent':
      busy = false
      break
  }

  return (
    <div className="flex w-full flex-col gap-3">
      <Button
        type="button"
        size="lg"
        className="h-12 w-full text-base"
        disabled={busy || state.kind === 'consent'}
        aria-busy={busy}
        onClick={signIn}
      >
        {busy ? (
          <>
            <Loader2Icon className="animate-spin" aria-hidden />
            {t.signingIn}
          </>
        ) : (
          t.signInWithGoogle
        )}
      </Button>

      <p
        role="alert"
        aria-live="polite"
        className={cn('min-h-5 text-sm', message?.tone === 'info' ? 'text-text-secondary' : 'text-error')}
      >
        {message?.text}
      </p>

      {state.kind === 'consent' && (
        <PrivacyConsentDialog
          policyVersion={state.policyVersion}
          onAccepted={consentAccepted}
          onDeclined={declineConsent}
          onToast={toast.error}
        />
      )}
    </div>
  )
}
