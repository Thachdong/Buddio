/**
 * npm run seed — ghi dữ liệu mẫu vào emulator bằng Admin SDK (bỏ qua rules).
 * Mỗi task thêm fixtures/<task-id>.ts. Seed phải idempotent: dùng set() với id cố định.
 */
const projectId = (process.env.FIREBASE_PROJECT_ID ??= 'demo-buddio')

if (!projectId.startsWith('demo-')) {
  console.error('seed chỉ chạy trên emulator (project demo-*)')
  process.exit(1)
}
// Project demo-* luôn đi emulator: đặt host mặc định nếu chưa có (.env không tự nạp khi chạy tsx)
process.env.FIRESTORE_EMULATOR_HOST ??= '127.0.0.1:8080'
process.env.FIREBASE_AUTH_EMULATOR_HOST ??= '127.0.0.1:9099'

async function main() {
  // import động: phải đặt biến *_EMULATOR_HOST trước khi Admin SDK khởi tạo
  const { seedT002 } = await import('./fixtures/T-002')
  const fixtures: Array<() => Promise<void>> = [seedT002]
  for (const run of fixtures) await run()
  console.log(`seed xong (${fixtures.length} fixture) — project ${projectId}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

export {} // module scope
