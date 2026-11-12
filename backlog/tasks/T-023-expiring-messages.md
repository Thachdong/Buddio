# T-023 · Tin hết hạn ở phòng ngắn hạn

| Epic | Milestone | Point | Phụ thuộc | Trạng thái |
|---|---|---|---|---|
| EPIC-05 | M3 | 3 | T-019, T-021 | TODO |

## 1. Mục tiêu demo
Sau task này: **Trong phòng ngắn hạn, seed một tin có `expire_at` còn 30 giây → A và B đang mở phòng thấy tin tự biến mất đúng giờ (≤1 phút), danh sách phòng SCR-03 cập nhật tin cuối và số chưa đọc; repo có cấu hình TTL policy cho `messages.expire_at` và lifecycle `rooms/` (`daysSinceCustomTime: 0`), được kiểm bằng test cấu hình.**

## 2. Phạm vi
| Loại | ID | Ghi chú |
|---|---|---|
| Thao tác | (hành vi trong SCR-05, SCR-03) | Hẹn giờ ẩn tin, ảnh, tin cuối |
| API | — | Firestore TTL + Storage lifecycle (ADR-09) |
| Dữ liệu | TBL-09 `expire_at` | TTL policy (collection group `messages`) |
| Dữ liệu | Cloud Storage | Lifecycle `rooms/` `daysSinceCustomTime: 0` |
| Rule | BR-16 | Tin + ảnh tự xóa sau thời hạn tính từ lúc gửi |
| Phụ trợ | SUP-05 | Tự xóa tin & ảnh hết hạn |
| NFR | NFR-19 | Biến mất khỏi màn ≤1 phút; xóa hẳn ≤24h (cấu hình) |
| Flow | FLOW-10c bước 1–3 | |

**Ngoài phạm vi:** xác minh TTL / lifecycle xóa vật lý thật (cần project Firebase thật – emulator không chạy TTL / lifecycle; ghi chú ở T-028); alert "xóa tin hết hạn trễ >1 giờ" (T-028); TTL `notifications` (T-024), TTL `friend_requests` (T-006).

## 3. Việc cần làm
### UI
- [ ] SCR-05: hook `useExpiryTimer(messages)` — với tin có `expire_at`, hẹn một timer cho thời điểm hết hạn gần nhất (dùng `serverTimeOffset` để bù lệch đồng hồ), tới giờ → loại tin khỏi danh sách hiển thị và hẹn tiếp tin kế; áp cho tin người dùng, tin hệ thống, tin đã thu hồi.
- [ ] Viewer ảnh (T-019) đang mở ảnh của tin vừa hết hạn → đóng viewer; menu tin / sheet "Đã xem" của tin vừa hết hạn → đóng.
- [ ] Sau khi mọi tin hết hạn → trạng thái Empty "Chưa có tin nhắn. Hãy gửi lời chào!".
- [ ] Tab bị ẩn rồi hiện lại (`visibilitychange`) → lọc lại ngay theo `now` (timer có thể bị trình duyệt trì hoãn).
- [ ] SCR-03: timer cho `rooms.last_message.expire_at` → tới giờ đổi xem trước thành "Không có tin nhắn" và tính lại số chưa đọc (hàm đếm T-021 đã loại tin quá hạn).
- [ ] Badge tab Phòng (LAYOUT.A3) cập nhật theo.

### API / Backend
- [ ] Không có endpoint mới. Rà lại: `createMessage` đã ghi `expire_at` (T-009) và `customTime` (T-019); `listMessageImageUrls` không cấp URL cho tin quá hạn (T-019); `recallMessage` trả 404 cho tin quá hạn (T-020).

### Data
- [ ] `firestore.indexes.json` → `fieldOverrides`: `{collectionGroup: "messages", fieldPath: "expire_at", ttl: true, indexes: []}` (khai báo TTL policy bằng Firebase CLI) `[ASSUMED → Q-047]`.
- [ ] `infra/storage-lifecycle.json`: thêm rule `{action: {type: "Delete"}, condition: {daysSinceCustomTime: 0, matchesPrefix: ["rooms/"]}}` cạnh rule `uploads/` của T-019.
- [ ] Script `infra/apply-storage-lifecycle.sh` (`gcloud storage buckets update gs://$BUCKET --lifecycle-file=infra/storage-lifecycle.json`) — chỉ chạy khi có project thật (T-028 runbook).
- [ ] Seed `scripts/seed/expiring.ts`: phòng ngắn hạn P2 có 3 tin `expire_at = now + 30s / + 60s / + 1 ngày`, 1 tin có ảnh `expire_at = now + 30s`, tin cuối của phòng P4 `expire_at = now + 30s`.

### Khác
- [ ] Test cấu hình (Vitest) đọc `firestore.indexes.json`, `infra/storage-lifecycle.json` và khẳng định đủ rule.

## 4. Acceptance criteria
| # | Given | When | Then | Nguồn |
|---|---|---|---|---|
| AC-1 | A và B đang mở phòng ngắn hạn P2, có tin X với `expire_at = now + 30s` | Chờ tới `expire_at` | Tin X biến mất khỏi màn A và B trong ≤1 phút sau `expire_at` (mục tiêu ≤5 giây trên local), không cần tải lại; tin còn hạn vẫn hiện | FLOW-10c bước 1–3, NFR-19 |
| AC-2 | Tin X có 2 ảnh, B đang mở viewer ảnh của X | Tới `expire_at` | Viewer đóng, tin X biến mất; gọi `listMessageImageUrls` cho X → `404 MESSAGE_NOT_FOUND` | FLOW-10c bước 2, SUP-08, BR-16 |
| AC-3 | Tin X là tin cuối của phòng P4, B đang ở SCR-03, X chưa đọc | Tới `expire_at` của X | Hàng P4 đổi xem trước thành "Không có tin nhắn", badge P4 và badge tab giảm tương ứng, trong ≤1 phút | FLOW-10c bước 3, SUP-04, Q-044 |
| AC-4 | Phòng P2 chỉ còn tin sắp hết hạn | Tất cả hết hạn | Màn chat hiện "Chưa có tin nhắn. Hãy gửi lời chào!" | SCR-05 trạng thái Empty / Tin hết hạn |
| AC-5 | B ẩn tab trình duyệt trước `expire_at`, hiện lại sau `expire_at` | Tab hiện lại | Tin đã hết hạn không còn hiển thị ngay khi tab hiện lại | NFR-19 |
| AC-6 | Đồng hồ máy B chạy nhanh 2 phút so với server | Mở P2 có tin `expire_at = now + 30s` (giờ server) | Tin vẫn hiện tới đúng `expire_at` theo giờ server (sai lệch ≤5 giây), không biến mất sớm | NFR-19 `[ASSUMED → Q-047]` dùng `serverTimeOffset` |
| AC-7 | Repo | Chạy test cấu hình | `firestore.indexes.json` có TTL `messages.expire_at`; `infra/storage-lifecycle.json` có rule Delete `daysSinceCustomTime: 0` + `matchesPrefix ["rooms/"]` và rule `age: 1` + `["uploads/"]` | BR-16, SUP-05, ADR-09 |
| AC-8 | Phòng lâu dài | Mở phòng có tin cũ 1 năm (seed) | Tin vẫn hiển thị; không có timer nào được hẹn (`expire_at = null`) | BR-16 |

## 5. Test
### Unit / integration
| Case | Phủ AC |
|---|---|
| `useExpiryTimer` (Vitest fake timers): 3 tin hết hạn ở các mốc khác nhau → loại đúng thứ tự; tin `expire_at = null` không hẹn timer | AC-1, AC-8 |
| `useExpiryTimer` với `serverTimeOffset = −120000` → không loại sớm | AC-6 |
| `visibilitychange` → lọc lại ngay | AC-5 |
| SCR-03 preview: `last_message.expire_at` qua → "Không có tin nhắn"; trigger tính lại badge | AC-3 |
| Test cấu hình JSON (TTL + 2 rule lifecycle) | AC-7 |
| `listMessageImageUrls` cho tin quá hạn → 404 (đã có ở T-019, chạy lại trong suite) | AC-2 |

### E2E
| Kịch bản | Phủ AC |
|---|---|
| Playwright: seed tin `expire_at = now + 20s` → A mở P2 → `expect(tin).toBeHidden({timeout: 60000})` sau mốc; tin khác vẫn hiện; danh sách phòng P4 đổi sang "Không có tin nhắn" | AC-1, AC-3 |
| Phòng chỉ có tin sắp hết hạn → sau mốc thấy trạng thái Empty | AC-4 |

### Dữ liệu seed / tiền điều kiện
- Seed T-009/T-019/T-021 + `scripts/seed/expiring.ts` (chạy ngay trước khi test vì mốc thời gian tương đối).

### Test tay
| Bước | Thao tác | Kết quả mong đợi | AC |
|---|---|---|---|
| 1 | Chạy `npm run seed:expiring`; A và B mở P2 | Thấy 3 tin + 1 tin ảnh | — |
| 2 | B mở viewer ảnh của tin sắp hết hạn; chờ 30 giây | Viewer đóng, tin ảnh và tin +30s biến mất trên cả hai máy | AC-1, AC-2 |
| 3 | Chờ thêm 30 giây | Tin +60s biến mất; tin +1 ngày còn | AC-1 |
| 4 | Chạy lại seed; B ở SCR-03 nhìn hàng P4 | Sau 30 giây: "Không có tin nhắn", badge giảm | AC-3 |
| 5 | Chạy lại seed; B chuyển sang tab khác 1 phút rồi quay lại P2 | Tin đã hết hạn không còn | AC-5 |
| 6 | Mở `firestore.indexes.json`, `infra/storage-lifecycle.json` | Có TTL `messages.expire_at`, rule `rooms/` và `uploads/` | AC-7 |
| 7 | Mở phòng lâu dài P1 có tin seed cũ 1 năm | Tin vẫn hiện | AC-8 |

## 6. Definition of Done
- [ ] DoD chung (xem `backlog.md` mục 1)
- [ ] Test cấu hình TTL + lifecycle pass trên CI
- [ ] Runbook ghi bước áp TTL / lifecycle lên project thật (bàn giao cho T-028)

## 7. Ghi chú
- `[ASSUMED → Q-047]` Khai báo TTL bằng `fieldOverrides[].ttl = true` trong `firestore.indexes.json` (Firebase CLI hỗ trợ); nếu phiên bản CLI lúc làm không hỗ trợ → thay bằng script `gcloud firestore fields ttls update expire_at --collection-group=messages --enable-ttl`.
- `[ASSUMED → Q-047]` Dùng `.info/serverTimeOffset` của RTDB (đã kết nối từ T-022) để bù lệch đồng hồ thiết bị.
- Emulator không xóa theo TTL / lifecycle → document và file vẫn còn trong emulator sau `expire_at`; việc "xóa hẳn ≤24h" chỉ kiểm được trên project thật (T-028, ngoài môi trường kiểm tra Q-045).
- Point 3 giữ nguyên.
