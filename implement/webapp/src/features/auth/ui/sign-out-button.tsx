'use client'
import { Loader2Icon, LogOutIcon } from 'lucide-react'
import { vi } from '@/shared/i18n/vi'
import { Button } from '@/shared/ui/button'
import { useSignOut } from '../hooks/use-sign-out'

/** SCR-11 thành phần 10 — "Đăng xuất" (không cần xác nhận, SCR-11.A4). */
export function SignOutButton() {
  const { pending, signOut } = useSignOut()
  return (
    <Button
      type="button"
      variant="outline"
      size="lg"
      className="h-11 w-full"
      disabled={pending}
      aria-busy={pending}
      onClick={signOut}
    >
      {pending ? <Loader2Icon className="animate-spin" aria-hidden /> : <LogOutIcon aria-hidden />}
      {vi.account.settings.signOut}
    </Button>
  )
}
