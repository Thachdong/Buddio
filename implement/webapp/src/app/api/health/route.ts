import { HealthSchema } from '@/shared/contracts'
import { runRoute } from '@/shared/server/route'

/** getHealth — GET /api/health. Uptime check (ADR-12): public, không đọc dữ liệu nghiệp vụ. */
export const GET = runRoute({ name: 'getHealth', auth: 'public', output: HealthSchema }, async () => ({
  status: 'ok' as const,
}))
