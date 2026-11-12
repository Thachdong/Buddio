# T-028 · Vận hành: tải, sao lưu, cảnh báo, nhật ký an toàn

| Epic | Milestone | Point | Phụ thuộc | Trạng thái |
|---|---|---|---|---|
| EPIC-07 | M5 | 5 | T-023, T-026 | TODO |

## 1. Mục tiêu demo
Sau task này: **Dev chạy `npm run load:chat` trên emulator: 200 người dùng ảo gửi tin trong 5 phút → báo cáo P95 gửi→nhận ≤1s, 0 tin mất, 0 tin trùng; CI có test khẳng định log không chứa nội dung tin / email; repo có cấu hình sao lưu hằng ngày giữ 7 ngày, alert NFR-26, uptime check `/api/health`, TTL, lifecycle, kèm runbook triển khai và khôi phục.**

## 2. Phạm vi
| Loại | ID | Ghi chú |
|---|---|---|
| Thao tác | — | Không có màn |
| API | `getHealth` | Uptime check; kiểm phản hồi nhanh, không cần xác thực |
| Dữ liệu | — | Cấu hình hạ tầng (`infra/`) |
| NFR | NFR-07 | Tải: 1k online, 200k tin/ngày (mô phỏng thu nhỏ trên emulator) |
| NFR | NFR-09 | Uptime check |
| NFR | NFR-18 | Dữ liệu đã xóa hết khỏi backup ≤30 ngày (giữ 7 ngày) |
| NFR | NFR-20 | Backup hằng ngày, giữ 7 ngày, RPO 24h, RTO 4h (runbook) |
| NFR | NFR-26 | 4 alert: gửi tin lỗi >1%/5', xóa tin hết hạn trễ >1h, đăng nhập Google lỗi >5%/5', không phản hồi >2' |
| NFR | NFR-27 | Log không chứa nội dung tin, ảnh, email |
| NFR | NFR-01, NFR-10 | Đo lại dưới tải: P95 ≤1s, không mất / trùng |

**Ngoài phạm vi:** áp cấu hình lên project Firebase thật và đo tải thật (môi trường kiểm tra chỉ local – Q-045; làm khi có staging); kiểm TTL / lifecycle xóa vật lý thật (chuyển từ T-023, cùng điều kiện staging).

## 3. Việc cần làm
### UI
- [ ] Không có.

### API / Backend
- [ ] Logger có cấu trúc (từ T-001): thêm sự kiện chuẩn `message_send` (`result: ok|error`, `code`), `session_create` (`result`, `code`) để làm log-based metric; kiểm không field nào chứa text / email / tên.
- [ ] Bộ lọc `redact` trung tâm trong logger: chặn key `text`, `email`, `emailNorm`, `displayName`, `token`, `uploadPath`; chuỗi dạng email trong mọi field → `[redacted]`.
- [ ] `getHealth`: trả `{status: "ok"}` ≤200ms, không đọc Firestore `[ASSUMED → Q-047]` (uptime check chỉ đo app sống).

### Data
- [ ] Không có thay đổi schema.

### Khác
- [ ] **Load test** `scripts/load/chat-load.ts` (Node + Firebase JS SDK + Admin SDK trên emulator) `[ASSUMED → Q-047]` thay k6 / Artillery: seed 200 user + 40 phòng × 5 thành viên; mỗi user ảo giữ listener phòng của mình và gửi 1 tin / 10 giây qua `createMessage` trong 5 phút (~6.000 tin, ~20 tin/giây ≈ 8 lần trung bình của 200k tin/ngày); ghi thời điểm gửi (client) và nhận (listener của từng thành viên khác) theo `messageId`; xuất `reports/load-<date>.json` + tóm tắt P50/P95/P99, số tin mất, số tin trùng, tỉ lệ lỗi API.
- [ ] **Sao lưu**: `infra/backup.sh` — `gcloud firestore backups schedules create --database='(default)' --recurrence=daily --retention=7d`.
- [ ] **Alert NFR-26** (`infra/monitoring/*.json`, áp bằng `gcloud monitoring policies create --policy-from-file`):
  - Log-based metric `message_send_errors` / `message_send_total` → alert tỉ lệ >1% trong 5 phút.
  - Metric Firestore TTL `firestore.googleapis.com/document/ttl_expiration_to_deletion_delays` → alert khi trễ >1 giờ `[ASSUMED → Q-047]`.
  - Log-based metric `session_create` lỗi / tổng → alert >5% trong 5 phút.
  - Uptime check `GET /api/health` mỗi 1 phút từ ≥3 vùng → alert khi thất bại >2 phút.
  - Kênh nhận: email nhóm vận hành (biến `ALERT_EMAIL`) `[ASSUMED → Q-047]`.
- [ ] **Uptime**: `infra/monitoring/uptime-health.json`.
- [ ] **TTL & lifecycle**: gom vào `infra/README` lệnh áp TTL (`messages`, `notifications`, `friend_requests`) và `storage-lifecycle.json` (từ T-019, T-023).
- [ ] **Runbook** `docs/runbook.md`: thứ tự triển khai lần đầu (rules, indexes, TTL, lifecycle, backup, metric, alert, uptime, Secret Manager khóa link mời), khôi phục backup sang database mới + chuyển app (mục tiêu ≤4h), kiểm tra sau deploy, việc phải làm khi có staging (đo tải thật, xác minh TTL / lifecycle ≤24h).
- [ ] Test cấu hình (Vitest) đọc các file `infra/**` khẳng định giá trị (retention 7d, ngưỡng 1% / 5%, 300s, 3600s, 120s, path `/api/health`).
- [ ] Script `npm run load:chat` + tài liệu cách chạy trong README.

## 4. Acceptance criteria
| # | Given | When | Then | Nguồn |
|---|---|---|---|---|
| AC-1 | Emulator đang chạy, app `next start` (build production) | Chạy `npm run load:chat` (200 user ảo, 5 phút) | Báo cáo: P95 thời gian gửi→nhận ≤1 giây; tỉ lệ lỗi API ≤1%; 200 user ảo hoạt động đủ 5 phút | NFR-01, NFR-07 |
| AC-2 | Như AC-1 | Đối chiếu `messageId` gửi và nhận | Mỗi tin gửi thành công được mọi thành viên khác nhận đúng 1 lần (0 mất, 0 trùng); số document trong emulator = số tin gửi thành công | NFR-10, NFR-07 |
| AC-3 | Bộ test integration chạy các luồng `createMessage` (chữ "SECRET-MSG-123"), `createEmailLookup` / `createFriendRequest` / `createInviteLink` với email "leak.check@example.com", `createSession`, `deleteMe` | Thu toàn bộ log trong lúc chạy | Không dòng log nào chứa "SECRET-MSG-123", "leak.check@example.com" hay chuỗi dạng email; có sự kiện `message_send` với `result` | NFR-27 |
| AC-4 | Repo | Chạy test cấu hình | `infra/backup.sh` có `--recurrence=daily --retention=7d`; có 4 policy alert với ngưỡng 1%/300s, 3600s, 5%/300s, 120s; uptime check trỏ `/api/health` | NFR-20, NFR-18, NFR-26, NFR-09 |
| AC-5 | App đang chạy | `GET /api/health` không token | `200 {"status":"ok"}`, thời gian ≤200ms | NFR-09, `getHealth` |
| AC-6 | `docs/runbook.md` | Reviewer đọc theo | Có đủ: các bước triển khai lần đầu, lệnh khôi phục backup với mục tiêu RTO ≤4h / RPO 24h, danh sách việc chờ staging (đo tải thật, xác minh TTL / lifecycle ≤24h, áp alert) | NFR-20, NFR-19, Q-045 |
| AC-7 | Gửi tin lỗi (vd `ROOM_READ_ONLY`) và đăng nhập lỗi | Xem log | Có sự kiện `message_send` `result=error` + `code`, `session_create` `result=error` (đủ để dựng log-based metric) | NFR-26 |

## 5. Test
### Unit / integration
| Case | Phủ AC |
|---|---|
| Logger `redact`: object có `text`, `email`, chuỗi chứa email → bị che | AC-3 |
| Suite "log leak" (Vitest + emulator): chạy các handler nêu ở AC-3, gom output logger, assert không có chuỗi cấm | AC-3, AC-7 |
| Test cấu hình `infra/**` | AC-4 |
| `getHealth` handler: 200, không cần token, không gọi Firestore | AC-5 |

### E2E
| Kịch bản | Phủ AC |
|---|---|
| Load test `npm run load:chat` (job CI thủ công / nightly, không chặn PR) `[ASSUMED → Q-047]` | AC-1, AC-2 |
| Playwright smoke `GET /api/health` | AC-5 |

### Dữ liệu seed / tiền điều kiện
- Script load tự seed 200 user (Auth emulator), quan hệ bạn bè, 40 phòng × 5 thành viên, `config/limits`.
- Máy chạy load: ghi cấu hình CPU / RAM vào báo cáo.

### Test tay
| Bước | Thao tác | Kết quả mong đợi | AC |
|---|---|---|---|
| 1 | `firebase emulators:start` + `npm run build && npm start` + `npm run load:chat` | Chạy 5 phút, in bảng P50/P95/P99, mất 0, trùng 0, lỗi ≤1%; P95 ≤1s | AC-1, AC-2 |
| 2 | `curl -i localhost:3000/api/health` | 200 `{"status":"ok"}` | AC-5 |
| 3 | Gửi tin "SECRET-MSG-123" qua UI, tra email "leak.check@example.com"; `grep` log terminal | Không thấy hai chuỗi | AC-3 |
| 4 | Gửi tin vào phòng chỉ đọc qua API | Log có `message_send result=error code=ROOM_READ_ONLY` | AC-7 |
| 5 | Đọc `docs/runbook.md` và `infra/` | Đủ mục như AC-4, AC-6 | AC-4, AC-6 |

## 6. Definition of Done
- [ ] DoD chung (xem `backlog.md` mục 1)
- [ ] Báo cáo load test đầu tiên lưu ở `reports/` và tóm tắt trong mô tả PR
- [ ] Suite "log leak" chạy trên CI mỗi PR
- [ ] Runbook được reviewer đọc và xác nhận đủ bước

## 7. Ghi chú
- `[ASSUMED → Q-047]` Dùng script Node + Firebase JS SDK thay k6 / Artillery (slices.md ghi "k6 hoặc Artillery"): k6 không chạy được Firebase JS SDK để nghe listener Firestore nên không đo được gửi→nhận; Artillery + Playwright quá nặng cho 200 client trên 1 máy.
- `[ASSUMED → Q-047]` Tải mô phỏng 200 user / 20 tin/giây trên emulator — emulator không phản ánh hiệu năng Firestore thật; con số chỉ dùng để phát hiện lỗi logic (mất / trùng tin, nghẽn handler). NFR-07 đầy đủ (1k online) chỉ đo được trên staging.
- `[ASSUMED → Q-047]` Alert "xóa tin hết hạn trễ >1 giờ" dựa trên metric TTL của Firestore; nếu metric không có ở region → thay bằng job kiểm định kỳ (cần quyết định ở Phase 3).
- `[ASSUMED → Q-047]` Kênh alert = email; `getHealth` không đọc Firestore.
- Point 5 giữ nguyên, nhưng là cận trên: nếu phải viết alert bằng Terraform thay `gcloud` JSON thì nên tách "load test + log" (3) và "cấu hình vận hành + runbook" (3).
