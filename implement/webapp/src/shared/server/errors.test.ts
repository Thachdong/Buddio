import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import { AccountCreateSchema } from '@/features/account/contracts'
import { AppError, toAppError } from './errors'

describe('error handler chung (runAction / runRoute)', () => {
  it('AC-13: lỗi Zod → VALIDATION_FAILED 400 kèm details[].field', () => {
    const r = AccountCreateSchema.safeParse({ acceptPrivacyPolicy: false })
    const e = toAppError(r.error)
    expect(e.code).toBe('VALIDATION_FAILED')
    expect(e.status).toBe(400)
    const fields = e.toPayload().details?.map((d) => d.field)
    expect(fields).toEqual(expect.arrayContaining(['acceptPrivacyPolicy', 'policyVersion']))
  })

  it('AC-11: lỗi lạ → INTERNAL_ERROR 500, payload không có stack', () => {
    const e = toAppError(new Error('boom at /secret/path.ts:1'))
    expect(e.code).toBe('INTERNAL_ERROR')
    expect(e.status).toBe(500)
    expect(JSON.stringify(e.toPayload())).not.toMatch(/boom|stack|path\.ts/)
  })

  it('AppError giữ code + status theo bảng', () => {
    expect(new AppError('UNAUTHENTICATED').status).toBe(401)
    expect(new AppError('CONSENT_REQUIRED').status).toBe(403)
    expect(toAppError(new z.ZodError([])).code).toBe('VALIDATION_FAILED')
  })
})
