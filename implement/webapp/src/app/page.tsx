import { redirect } from 'next/navigation'

/** `/` → trang Phòng. Chưa có cookie: proxy.ts đã chuyển /login; cookie sai: guard (tabs) chuyển /login. */
export default function Page() {
  redirect('/rooms')
}
