/**
 * npm run dev:age-session -- <email> <days>
 * Lùi users/{uid}.last_active_at = now − <days> ngày trên EMULATOR để demo / test tay hết phiên (T-003, NFR-11).
 * Tìm uid qua email_index/{email_norm}. Không bao giờ chạy với project thật.
 */
const projectId = (process.env.FIREBASE_PROJECT_ID ??= 'demo-buddio')
if (!projectId.startsWith('demo-')) {
  console.error('dev:age-session chỉ chạy trên emulator (project demo-*)')
  process.exit(1)
}
process.env.FIRESTORE_EMULATOR_HOST ??= '127.0.0.1:8080'

async function main() {
  const [email, daysArg] = process.argv.slice(2)
  const days = Number(daysArg)
  if (!email || !Number.isFinite(days)) {
    console.error('Cách dùng: npm run dev:age-session -- <email> <days>')
    process.exit(1)
  }
  const { Timestamp } = await import('firebase-admin/firestore')
  const { adminDb } = await import('@/shared/server/firebase-admin')
  const db = adminDb()
  const index = await db.doc(`email_index/${email.trim().toLowerCase()}`).get()
  const uid = index.data()?.uid as string | undefined
  if (!uid) {
    console.error('Không tìm thấy tài khoản đang hoạt động cho email này')
    process.exit(1)
  }
  const at = Timestamp.fromMillis(Date.now() - days * 24 * 60 * 60 * 1000)
  await db.doc(`users/${uid}`).update({ last_active_at: at })
  console.log(`users/${uid}.last_active_at = ${at.toDate().toISOString()} (−${days} ngày)`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

export {} // module scope (tránh trùng tên với script khác khi tsc)
