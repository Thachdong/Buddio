import { describe, expect, it, vi } from 'vitest'

// AC-2: getHealth không được chạm Firebase (không đọc dữ liệu nghiệp vụ)
const firebaseAdmin = vi.hoisted(() => ({
  adminDb: vi.fn(),
  adminAuth: vi.fn(),
  adminRtdb: vi.fn(),
  adminBucket: vi.fn(),
}))
vi.mock('@/shared/server/firebase-admin', () => firebaseAdmin)

import { HealthSchema } from '@/shared/contracts'
import { GET } from './route'

const call = () => GET(new Request('http://localhost/api/health'), { params: Promise.resolve({}) })

describe('GET /api/health (getHealth)', () => {
  it('AC-2: không kèm Authorization → 200 {"status":"ok"} khớp schema Health', async () => {
    vi.spyOn(console, 'log').mockImplementation(() => {})
    const res = await call()
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toEqual({ status: 'ok' })
    expect(HealthSchema.safeParse(body).success).toBe(true)
  })

  it('AC-2: không gọi Firestore / Auth / RTDB / Storage', async () => {
    vi.spyOn(console, 'log').mockImplementation(() => {})
    await call()
    for (const fn of Object.values(firebaseAdmin)) expect(fn).not.toHaveBeenCalled()
  })

  it('log request có method, path, status, ms — không có header Authorization', async () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {})
    await GET(new Request('http://localhost/api/health?x=1', { headers: { authorization: 'Bearer secret-token' } }), {
      params: Promise.resolve({}),
    })
    const line = log.mock.calls.map((c) => String(c[0])).find((l) => l.includes('"request"'))
    expect(line).toBeDefined()
    expect(JSON.parse(line!)).toMatchObject({ method: 'GET', path: '/api/health', status: 200, ms: expect.any(Number) })
    expect(line).not.toContain('secret-token')
  })
})
