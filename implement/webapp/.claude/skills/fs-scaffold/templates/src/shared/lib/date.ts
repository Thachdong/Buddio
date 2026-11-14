/** Hiển thị theo múi giờ thiết bị (NFR-24). Input là ISO string từ DTO. */
const dateTime = new Intl.DateTimeFormat('vi-VN', {
  hour: '2-digit',
  minute: '2-digit',
  day: '2-digit',
  month: '2-digit',
})

/** "HH:mm dd/MM" */
export function formatDateTime(iso: string): string {
  const parts = Object.fromEntries(dateTime.formatToParts(new Date(iso)).map((p) => [p.type, p.value]))
  return `${parts.hour}:${parts.minute} ${parts.day}/${parts.month}`
}
