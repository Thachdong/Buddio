import Link from 'next/link'
import { MessagesSquare } from 'lucide-react'
import { vi } from '@/shared/i18n/vi'
import { Button } from '@/shared/ui/button'

const t = vi.auth.login

/**
 * SCR-01 Đăng nhập — khung tĩnh (T-001). Server component.
 * Nút Google chưa gắn hành động: SCR-01.A1/A2, banner lời mời, vùng lỗi, dialog chính sách → T-002.
 */
export function LoginScreen() {
  return (
    <main className="flex min-h-dvh w-full flex-col items-center px-6 py-10">
      <div className="flex w-full max-w-[400px] flex-1 flex-col items-center justify-center gap-8 text-center">
        <div className="flex flex-col items-center gap-3">
          <div
            aria-hidden="true"
            className="flex size-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground"
          >
            <MessagesSquare className="size-8" />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">{vi.app.name}</h1>
          <p className="text-base text-muted-foreground">{t.tagline}</p>
        </div>

        <Button type="button" size="lg" className="h-12 w-full text-base">
          {t.signInWithGoogle}
        </Button>
      </div>

      <footer className="w-full max-w-[400px] pt-6 text-center">
        <Link
          href="/privacy"
          className="inline-flex min-h-11 items-center text-sm text-muted-foreground underline-offset-4 hover:underline focus-visible:underline"
        >
          {t.privacyPolicy}
        </Link>
      </footer>
    </main>
  )
}
