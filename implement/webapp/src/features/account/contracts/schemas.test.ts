import { describe, expect, it } from 'vitest'
import { PRIVACY_POLICY_VERSION } from '@/shared/contracts'
import { AccountCreateSchema } from './schemas'

describe('AccountCreateSchema (NFR-17)', () => {
  it('hợp lệ khi acceptPrivacyPolicy = true và đúng phiên bản', () => {
    expect(AccountCreateSchema.safeParse({ acceptPrivacyPolicy: true, policyVersion: PRIVACY_POLICY_VERSION }).success).toBe(true)
  })

  it.each([
    ['acceptPrivacyPolicy false', { acceptPrivacyPolicy: false, policyVersion: PRIVACY_POLICY_VERSION }],
    ['thiếu policyVersion', { acceptPrivacyPolicy: true }],
    ['sai phiên bản', { acceptPrivacyPolicy: true, policyVersion: '2020-01' }],
    ['policyVersion > 32 ký tự', { acceptPrivacyPolicy: true, policyVersion: 'x'.repeat(33) }],
    ['field lạ', { acceptPrivacyPolicy: true, policyVersion: PRIVACY_POLICY_VERSION, email: 'a@b.c' }],
  ])('AC-13: %s → lỗi (VALIDATION_FAILED)', (_, input) => {
    const r = AccountCreateSchema.safeParse(input)
    expect(r.success).toBe(false)
  })
})
