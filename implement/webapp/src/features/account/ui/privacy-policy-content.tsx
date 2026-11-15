import { PRIVACY_POLICY_VERSION } from '@/shared/contracts'
import { vi } from '@/shared/i18n/vi'

const t = vi.account.privacy

/** SCR-01 thành phần 7 + trang /privacy. View thuần (server hoặc client đều render được). */
export function PrivacyPolicyContent({ headingLevel = 'h2' }: { headingLevel?: 'h2' | 'h3' }) {
  const H = headingLevel
  return (
    <div className="flex flex-col gap-4 text-sm leading-relaxed text-foreground">
      {t.sections.map((s) => (
        <section key={s.heading} className="flex flex-col gap-1">
          <H className="font-semibold">{s.heading}</H>
          <p className="text-muted-foreground">{s.body}</p>
        </section>
      ))}
      <p className="text-xs text-muted-foreground">
        {t.version} {PRIVACY_POLICY_VERSION}
      </p>
    </div>
  )
}
