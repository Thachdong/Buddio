import { redirect } from 'next/navigation'

/** T-001: chưa có phiên → luôn về /login. Guard thật (có phiên → /rooms) ở T-002. */
export default function Page() {
  redirect('/login')
}
