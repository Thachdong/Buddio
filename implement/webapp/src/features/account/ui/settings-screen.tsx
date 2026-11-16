'use client'
import Link from 'next/link'
import { ChevronRightIcon, RotateCwIcon } from 'lucide-react'
import { SignOutButton } from '@/features/auth/ui/sign-out-button'
import { vi } from '@/shared/i18n/vi'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar'
import { Button } from '@/shared/ui/button'
import { Switch } from '@/shared/ui/switch'
import type { MySettings } from '../contracts'
import { useMySettings } from '../hooks/use-my-settings'

const t = vi.account.settings

/**
 * SCR-11 Cài đặt — T-003: chỉ xem (A0) + Đăng xuất (A4). Công tắc disabled tới T-004 [ASSUMED → Q-047];
 * "Danh sách đã chặn" (T-014), "Xóa tài khoản" (T-026) chưa hiện.
 */
export function SettingsScreen() {
  const { state, retry } = useMySettings()
  return (
    <main className="mx-auto flex w-full max-w-[560px] flex-1 flex-col">
      <header className="flex h-14 items-center px-4">
        <h1 className="text-xl font-semibold">{t.title}</h1>
      </header>
      <div className="flex flex-col gap-6 px-4 pb-6">
        {(() => {
          switch (state.status) {
            case 'loading':
              return <SettingsSkeleton />
            case 'error':
              return <SettingsError onRetry={retry} />
            case 'ready':
              return <SettingsView settings={state.settings} />
          }
        })()}
        <Link
          href="/privacy"
          className="flex min-h-11 items-center justify-between rounded-lg border border-border bg-surface px-4 text-sm font-medium outline-none hover:bg-surface-hover focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          {t.privacyPolicy}
          <ChevronRightIcon className="size-4 text-text-muted" aria-hidden />
        </Link>
        <SignOutButton />
      </div>
    </main>
  )
}

export function SettingsView({ settings }: { settings: MySettings }) {
  const initial = Array.from(settings.displayName || settings.email)[0]?.toUpperCase() ?? ''
  return (
    <>
      <section className="flex items-center gap-4">
        <div className="flex flex-col items-center gap-1">
          <Avatar className="size-16">
            {settings.photoUrl && <AvatarImage src={settings.photoUrl} alt={settings.displayName} />}
            <AvatarFallback className="text-lg">{initial}</AvatarFallback>
          </Avatar>
          <span className="text-xs text-text-muted">{t.photoCaption}</span>
        </div>
        <dl className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="min-w-0">
            <dt className="text-xs text-text-secondary">{t.displayName}</dt>
            <dd className="truncate text-base font-medium">{settings.displayName}</dd>
          </div>
          <div className="min-w-0">
            <dt className="text-xs text-text-secondary">{t.email}</dt>
            <dd className="truncate text-sm">{settings.email}</dd>
          </div>
        </dl>
      </section>

      <section aria-labelledby="privacy-settings" className="flex flex-col gap-1">
        <h2 id="privacy-settings" className="text-sm font-semibold text-text-secondary">
          {t.privacySection}
        </h2>
        <SettingSwitch id="anonymous" label={t.anonymous} description={t.anonymousDescription} checked={settings.anonymous} />
        <SettingSwitch id="show-online" label={t.showOnline} description={t.showOnlineDescription} checked={settings.showOnline} />
      </section>
    </>
  )
}

function SettingSwitch({ id, label, description, checked }: { id: string; label: string; description: string; checked: boolean }) {
  return (
    <div className="flex min-h-14 items-start justify-between gap-4 py-2">
      <div className="flex flex-col gap-0.5">
        <label htmlFor={id} className="text-sm font-medium">
          {label}
        </label>
        <p id={`${id}-desc`} className="text-xs text-text-secondary">
          {description}
        </p>
      </div>
      {/* T-003: chỉ xem — gạt được ở T-004 */}
      <Switch id={id} checked={checked} disabled aria-describedby={`${id}-desc`} className="mt-0.5" />
    </div>
  )
}

export function SettingsSkeleton() {
  return (
    <div role="status" aria-busy="true" className="flex flex-col gap-6">
      <span className="sr-only">{vi.common.loading}</span>
      <div className="flex items-center gap-4">
        <div className="size-16 animate-pulse rounded-full bg-muted" />
        <div className="flex flex-1 flex-col gap-2">
          <div className="h-5 w-32 animate-pulse rounded bg-muted" />
          <div className="h-4 w-48 animate-pulse rounded bg-muted" />
        </div>
      </div>
      <div className="h-12 animate-pulse rounded bg-muted" />
      <div className="h-12 animate-pulse rounded bg-muted" />
    </div>
  )
}

export function SettingsError({ onRetry }: { onRetry: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-center gap-3 rounded-lg border border-border p-6 text-center">
      <p className="text-sm font-medium">{t.loadError}</p>
      <Button type="button" variant="outline" className="h-11" onClick={onRetry}>
        <RotateCwIcon aria-hidden />
        {vi.common.retry}
      </Button>
    </div>
  )
}
