# T-004 · Cài đặt tài khoản: đổi tên, ẩn danh, hiển thị online

| Epic | Milestone | Point | Phụ thuộc | Trạng thái |
|---|---|---|---|---|
| EPIC-01 | M1 | 3 | T-003 | TODO |

## 1. Mục tiêu demo
Sau task này: **Người dùng mở Cài đặt → đổi tên thành "Minh" → bấm Lưu → thấy toast "Đã lưu" và tên mới ngay; gạt tắt "Chế độ ẩn danh" → lưu ngay không cần bấm Lưu; nhập tên trống hoặc dài hơn 50 ký tự → thấy lỗi dưới ô, tên cũ được giữ.**

## 2. Phạm vi
| Loại | ID | Ghi chú |
|---|---|---|
| Thao tác | SCR-11.A1 | Đổi tên hiển thị |
| Thao tác | SCR-11.A2 | Bật / tắt ẩn danh |
| Thao tác | SCR-11.A3 | Bật / tắt hiển thị online — chỉ lưu cài đặt |
| API | `updateMe` | `PATCH /api/me` |
| Dữ liệu | TBL-01 | ghi `anonymous`, `show_online`, `updated_at` |
| Dữ liệu | TBL-02 | ghi `display_name`, `display_name_custom`, `updated_at` |
| Rule | BR-02, BR-25 (lưu cài đặt), BR-29 | |
| NFR | NFR-04 | P95 ≤ 1s cho thao tác cài đặt |
| Flow | FLOW-02 bước 1–7 | happy path |
| Flow | FLOW-02 A1, E1 | lưu ngay khi gạt; tên không hợp lệ |

**Ngoài phạm vi:** hiệu lực hiển thị online thật + ghi RTDB `status/{me}` khi gạt (T-022); hiệu lực ẩn danh với tra email (kiểm ở T-005); "Danh sách đã chặn" (T-014); xóa tài khoản (T-026).

## 3. Việc cần làm
### UI
- [ ] SCR-11 thành phần 4–5: ô tên (giá trị `profiles.display_name`) + bộ đếm "n/50" (giới hạn từ `limits.displayNameMax`); nút "Lưu" chỉ bật khi tên đã đổi **và** hợp lệ (sau trim, 1–50 ký tự).
- [ ] Validation phía client (Zod chung với server): trống → "Tên hiển thị không được để trống."; > 50 → "Tên tối đa 50 ký tự." hiện dưới ô.
- [ ] Bấm Lưu → spinner trên nút → `updateMe {displayName}` → toast "Đã lưu"; tên hiển thị cập nhật từ listener `profiles/{me}`. Lỗi `DISPLAY_NAME_INVALID` / `VALIDATION_FAILED` → lỗi dưới ô, giữ tên cũ trong hồ sơ (E1). Lỗi mạng → toast lỗi, giữ giá trị đang nhập.
- [ ] Mở khóa 2 công tắc (đã disabled ở T-003). Gạt → cập nhật lạc quan + spinner nhỏ → `updateMe {anonymous}` / `{showOnline}` → toast ngắn "Đã lưu"; lỗi → trả công tắc về trạng thái cũ + toast "Không lưu được, thử lại" (SCR-11.A2/A3 Khi lỗi).
- [ ] Khóa công tắc trong lúc đang lưu để tránh gửi chồng `[ASSUMED → Q-047]`.
- [ ] Mô tả công tắc: ẩn danh "Khi bật, người khác nhập email của bạn sẽ không tìm thấy bạn."; online "Khi tắt, mọi người thấy bạn offline và bạn cũng không thấy online của người khác."

### API / Backend
- [ ] `PATCH /api/me` (`updateMe`): `withAuth`; Zod `MeUpdate` (`minProperties: 1`, `additionalProperties: false`, `anonymous` / `showOnline` boolean) → sai cấu trúc `400 VALIDATION_FAILED`.
- [ ] `displayName`: trim; trống hoặc > `display_name_max` → `422 DISPLAY_NAME_INVALID`, không ghi gì (BR-29).
- [ ] Transaction: `profiles.display_name` = tên mới, `display_name_custom = true`, `updated_at`; `users.anonymous` / `users.show_online`, `updated_at`. Nhiều field trong một request → ghi cùng transaction.
- [ ] Trả `200 Me` sau cập nhật.
- [ ] Log chỉ ghi `uid` + tên các field đã đổi, không ghi giá trị tên (NFR-27).

### Data
- [ ] Không thêm field / index / rules (rules đọc `users`, `profiles` đã có ở T-002).

### Khác
- [ ] Thông điệp mới vào `messages/vi.ts`.

## 4. Acceptance criteria
| # | Given | When | Then | Nguồn |
|---|---|---|---|---|
| AC-1 | An ở Cài đặt, tên "An" | Nhập "Minh" → bấm Lưu | `updateMe` trả `200`; toast "Đã lưu"; ô tên và header hiện "Minh"; `profiles.display_name = "Minh"`, `display_name_custom = true` | FLOW-02 bước 3–6 |
| AC-2 | An đã đổi tên "Minh" | Đăng xuất, đăng nhập lại Google (tên Google "An") | Tên vẫn "Minh" | Q-029, FLOW-01 bước 7 |
| AC-3 | `anonymous = true` | Gạt tắt "Chế độ ẩn danh" | Không cần bấm Lưu; công tắc ở Tắt; toast "Đã lưu"; `users.anonymous = false`; reload trang vẫn Tắt | FLOW-02 A1, BR-02 |
| AC-4 | `show_online = true` | Gạt tắt "Hiển thị trạng thái online" | `users.show_online = false`; reload vẫn Tắt | FLOW-02 A1, BR-25 |
| AC-5 | Ô tên chỉ có khoảng trắng "   " | Quan sát nút Lưu / gọi API trực tiếp với `{displayName: "   "}` | Client: "Tên hiển thị không được để trống.", nút Lưu disabled; API: `422 DISPLAY_NAME_INVALID`; `profiles.display_name` không đổi | BR-29, FLOW-02 E1 |
| AC-6 | Ô tên 51 ký tự | Quan sát / gọi API trực tiếp | Client: "Tên tối đa 50 ký tự.", nút Lưu disabled; API: `422 DISPLAY_NAME_INVALID`; tên cũ giữ nguyên | BR-29, FLOW-02 E1 |
| AC-7 | Ô tên đúng 50 ký tự | Bấm Lưu | `200`, tên lưu đủ 50 ký tự | BR-29 (biên) |
| AC-8 | Ô tên "  Minh  " | Bấm Lưu | Lưu "Minh" (đã trim) | BR-29 |
| AC-9 | — | Gọi `PATCH /api/me` với `{}` hoặc `{email: "x@y.com"}` hoặc `{anonymous: "no"}` | `400 VALIDATION_FAILED`, không ghi gì | `MeUpdate` |
| AC-10 | Mạng lỗi (DevTools Offline) | Gạt công tắc ẩn danh | Công tắc trả về trạng thái cũ + toast "Không lưu được, thử lại" | SCR-11.A2 Khi lỗi |
| AC-11 | Chưa đăng nhập / chưa đồng ý chính sách | Gọi `PATCH /api/me` | `401 UNAUTHENTICATED` / `403 CONSENT_REQUIRED` | ADR-06, NFR-17 |
| AC-12 | Emulator local, 20 lượt `updateMe` liên tiếp | Đo thời gian phản hồi | P95 ≤ 1s | NFR-04 |

## 5. Test
### Unit / integration
| Case | Phủ AC |
|---|---|
| `updateMe {displayName:"Minh"}` (emulator) → `200`, kiểm `display_name`, `display_name_custom=true` | AC-1 |
| `createSession` sau khi `display_name_custom=true` → tên giữ (tái dùng test T-002 với dữ liệu từ `updateMe`) | AC-2 |
| `updateMe {anonymous:false}` / `{showOnline:false}` → `users` cập nhật, `profiles` không đổi | AC-3, AC-4 |
| `updateMe` tên "   " / 51 ký tự → `422 DISPLAY_NAME_INVALID`, document không đổi | AC-5, AC-6 |
| Tên 50 ký tự → `200`; "  Minh  " → lưu "Minh" | AC-7, AC-8 |
| Body `{}`, field lạ, sai kiểu → `400 VALIDATION_FAILED` | AC-9 |
| Không token / chưa có tài khoản → `401` / `403` | AC-11 |
| Vòng lặp 20 lượt gọi đo thời gian (emulator) → P95 ≤ 1000ms `[ASSUMED → Q-047]` chỉ đo trên emulator (Q-045) | AC-12 |
| Component test (Vitest + Testing Library): nút Lưu disabled khi tên trống / >50 / không đổi; hiện đúng thông điệp lỗi | AC-5, AC-6 |

### E2E
| Kịch bản | Phủ AC |
|---|---|
| An → Cài đặt → đổi tên "Minh" → Lưu → thấy toast + tên mới → gạt tắt ẩn danh → reload → công tắc vẫn Tắt | AC-1, AC-3 |
| Nhập tên trống → thấy lỗi, nút Lưu disabled; nhập 51 ký tự → lỗi; reload → tên cũ | AC-5, AC-6 |

### Dữ liệu seed / tiền điều kiện
- `config/limits` (T-002).
- An `an@gmail.com` (tên "An", `anonymous=true`, `show_online=true`, `display_name_custom=false`).

### Test tay
| Bước | Thao tác | Kết quả mong đợi | AC |
|---|---|---|---|
| 1 | Đăng nhập An (375×812) → tab Cài đặt | Tên "An", bộ đếm "2/50", 2 công tắc Bật | — |
| 2 | Xóa tên, nhập "  Minh  " → Lưu | Toast "Đã lưu", tên "Minh"; Firestore `display_name="Minh"`, `display_name_custom=true` | AC-1, AC-8 |
| 3 | Đăng xuất, đăng nhập lại An | Tên vẫn "Minh" | AC-2 |
| 4 | Gạt tắt "Chế độ ẩn danh" | Toast "Đã lưu"; Firestore `users.anonymous=false`; reload vẫn Tắt | AC-3 |
| 5 | Gạt tắt "Hiển thị trạng thái online" | `users.show_online=false`; reload vẫn Tắt | AC-4 |
| 6 | Xóa hết tên | "Tên hiển thị không được để trống.", Lưu mờ | AC-5 |
| 7 | Dán chuỗi 51 ký tự | "Tên tối đa 50 ký tự.", Lưu mờ; reload → "Minh" | AC-6 |
| 8 | Dán chuỗi đúng 50 ký tự → Lưu | Lưu thành công | AC-7 |
| 9 | `curl -X PATCH .../api/me -H "Authorization: Bearer <token>" -d '{}'` | `400 VALIDATION_FAILED` | AC-9 |
| 10 | DevTools Offline → gạt công tắc ẩn danh | Công tắc quay lại, toast lỗi | AC-10 |

## 6. Definition of Done
- [ ] DoD chung (xem `backlog.md` mục 1)
- [ ] Zod `MeUpdate` dùng chung client / server (một nguồn cho giới hạn 50 ký tự, đọc từ `limits`)
- [ ] Không còn công tắc disabled ở màn Cài đặt

## 7. Ghi chú
- `[ASSUMED → Q-047]` Gạt công tắc online trong task này **chỉ lưu `users.show_online`**; việc ghi RTDB `status/{me}` = offline / dừng LAYOUT.A4 (SCR-11.A3, ADR-05) làm ở T-022 vì presence chưa tồn tại.
- `[ASSUMED → Q-047]` Khóa công tắc khi đang lưu để tránh 2 request ngược nhau.
- `[ASSUMED → Q-047]` Đo NFR-04 trên emulator local chỉ mang tính kiểm hồi quy (Q-045), không thay cho đo trên môi trường thật.
- Hiệu lực "tên mới hiện ở mọi nơi kể cả tin cũ" (FLOW-02 bước 7) được bảo đảm bởi thiết kế đọc `profiles/{uid}` khi hiển thị; kiểm thật ở T-009 (tin nhắn).
