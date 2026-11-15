'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BellIcon, MessagesSquareIcon, SettingsIcon, UsersIcon } from 'lucide-react'
import { vi } from '@/shared/i18n/vi'
import { cn } from '@/shared/lib/utils'

const t = vi.account.tabs

const TABS = [
  { href: '/rooms', label: t.rooms, Icon: MessagesSquareIcon },
  { href: '/friends', label: t.friends, Icon: UsersIcon },
  { href: '/notifications', label: t.notifications, Icon: BellIcon },
  { href: '/settings', label: t.settings, Icon: SettingsIcon },
] as const

/** Layout chung mobile (wireframe.md mục 5): 4 tab dưới, icon + nhãn, vùng chạm ≥ 44px. Badge ở T-008/T-024. */
export function TabBar() {
  const pathname = usePathname()
  return (
    <nav
      aria-label={t.label}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="mx-auto grid max-w-[720px] grid-cols-4">
        {TABS.map(({ href, label, Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`)
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex min-h-14 flex-col items-center justify-center gap-0.5 text-xs outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
                  active ? 'font-semibold text-primary' : 'text-text-secondary hover:text-text',
                )}
              >
                <Icon className="size-5" aria-hidden strokeWidth={active ? 2.5 : 2} />
                {label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
