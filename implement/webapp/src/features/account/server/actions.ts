'use server'

import type { ActionResult } from '@/shared/contracts'
import { runAction } from '@/shared/server/action'
import { AccountCreateSchema, MeWithLimitsSchema, type MeWithLimits } from '../contracts'
import { createAccount } from './services/account.service'

/** createAccount (SCR-01.A2). Lần 2 trả tài khoản hiện có — `created` bị output schema loại. */
export async function createAccountAction(input: unknown): Promise<ActionResult<MeWithLimits>> {
  return runAction(
    { name: 'createAccount', auth: 'identity', schema: AccountCreateSchema, output: MeWithLimitsSchema, input },
    (data, ctx) => createAccount(ctx, data),
  )
}
