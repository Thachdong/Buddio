/**
 * npm run seed — ghi dữ liệu mẫu vào emulator bằng Admin SDK (bỏ qua rules).
 * T-001: rỗng. T-002 thêm config/limits (TBL-11) và user mẫu qua fixtures/<task-id>.ts.
 * Seed phải idempotent: dùng set() với id cố định.
 */
const projectId = process.env.FIREBASE_PROJECT_ID ?? 'demo-buddio'

if (!projectId.startsWith('demo-') && !process.env.FIRESTORE_EMULATOR_HOST) {
  console.error('seed chỉ chạy trên emulator (project demo-* hoặc FIRESTORE_EMULATOR_HOST)')
  process.exit(1)
}

async function main() {
  const fixtures: Array<() => Promise<void>> = []
  for (const run of fixtures) await run()
  console.log(`seed xong (${fixtures.length} fixture) — project ${projectId}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
