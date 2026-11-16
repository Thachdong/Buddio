import type { Metadata } from 'next'
import Link from 'next/link'
import { PrivacyPolicyContent } from '@/features/account/ui/privacy-policy-content'
import { vi } from '@/shared/i18n/vi'

export const metadata: Metadata = { title: `${vi.account.privacy.title} · ${vi.app.name}` }

/** /privacy — trang tĩnh công khai (SCR-01 thành phần 6), cùng nội dung dialog chính sách. */
export default function Page() {
  return (
    <main className="mx-auto flex w-full max-w-[640px] flex-col gap-6 px-6 py-10">
      <h1 className="text-2xl font-semibold">{vi.account.privacy.title}</h1>
      <PrivacyPolicyContent />
      <Link href="/login" className="inline-flex min-h-11 items-center text-sm text-primary underline-offset-4 hover:underline">
        {vi.app.name}
      </Link>
    </main>
  )
}
