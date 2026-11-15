import Link from 'next/link'
import { ConstructionIcon } from 'lucide-react'
import { vi } from '@/shared/i18n/vi'
import { Button } from '@/shared/ui/button'

const t = vi.account.comingSoon

/** Trang giữ chỗ "Sắp có" cho tab / màn chưa làm [ASSUMED → Q-047]. */
export function ComingSoonScreen({ title }: { title: string }) {
  return (
    <main className="flex flex-1 flex-col">
      <header className="flex h-14 items-center px-4">
        <h1 className="text-lg font-semibold">{title}</h1>
      </header>
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
        <ConstructionIcon className="size-10 text-text-muted" aria-hidden />
        <p className="text-base font-medium">{t.title}</p>
        <p className="text-sm text-muted-foreground">{t.body}</p>
        <Button asChild variant="outline" className="mt-2 h-11">
          <Link href="/rooms">{t.back}</Link>
        </Button>
      </div>
    </main>
  )
}
