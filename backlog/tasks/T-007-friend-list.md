# T-007 · Danh sách bạn bè

| Epic | Milestone | Point | Phụ thuộc | Trạng thái |
|---|---|---|---|---|
| EPIC-02 | M1 | 2 | T-006 | TODO |

## 1. Mục tiêu demo
Sau task này: **A mở tab Bạn bè → thấy "Bạn bè (n)" và B (ảnh, tên, email), sắp xếp theo tên A→Z; khi D chấp nhận lời mời của A ở máy khác → D xuất hiện trong danh sách của A ngay, không cần tải lại.** Chưa có bạn → trạng thái rỗng "Chưa có bạn bè" với nút "Thêm bạn".

## 2. Phạm vi
| Loại | ID | Ghi chú |
|---|---|---|
| Thao tác | SCR-08.A0 | Listener `friendships` + `profiles` get |
| Thao tác | SCR-08.A3 | NAV → SCR-07 / SCR-09 (nút đã có từ T-005, T-006; kiểm lại) |
| API | — | Không API (Firestore listener) |
| Dữ liệu | TBL-05 | chỉ đọc; index `idx_fs_member` |
| Dữ liệu | TBL-02 | chỉ đọc (get từng profile) |
| Rule | BR-27 | bạn bè thấy tên, ảnh, email |
| Flow | FLOW-06 bước 1–2 | phần xem danh sách |

**Ngoài phạm vi:** chấm online (BR-25, T-022); menu ⋮ Hủy kết bạn (T-013) / Chặn (T-014); mở sẵn dialog hủy khi đến từ "Hai bạn đã là bạn bè" (T-013).

## 3. Việc cần làm
### UI
- [ ] SCR-08: tiêu đề "Bạn bè (n)" (thành phần 4) dưới hàng "Lời mời kết bạn".
- [ ] Hàng bạn (thành phần 5): ảnh (fallback chữ cái đầu khi không có ảnh), tên, email; sắp theo `display_name` A→Z bằng `Intl.Collator('vi')` (Q-044).
- [ ] Trạng thái: loading 6 hàng skeleton; empty (thành phần 10) "Chưa có bạn bè" + "Nhập email của người quen để kết bạn hoặc gửi link mời." + nút "Thêm bạn" → SCR-07 (hàng "Lời mời kết bạn" vẫn hiện); lỗi "Không tải được danh sách bạn" + "Thử lại".
- [ ] Profile có `status = deleted` (dữ liệu chưa dọn) → hiện "Người dùng đã xóa", không email `[ASSUMED → Q-047]`.

### API / Backend
- [ ] Không có endpoint mới.

### Data
- [ ] `firestore.indexes.json`: `idx_fs_member` (`member_uids` array-contains, `since` desc).
- [ ] Hook `useFriends()`: `onSnapshot(query(friendships, where('member_uids','array-contains', me), orderBy('since','desc')))` → với mỗi uid bạn, `getDoc(profiles/{uid})` (cache theo uid trong phiên); sắp xếp phía client.
- [ ] Rules: không đổi (`friendships` đọc khi là thành viên – T-005; `profiles` get khi đã đăng nhập, cấm list – T-002). Thêm test truy vấn listener.

### Khác
- [ ] —

## 4. Acceptance criteria
| # | Given | When | Then | Nguồn |
|---|---|---|---|---|
| AC-1 | A là bạn của B ("Bình") và C ("An Chi") | A mở tab Bạn bè | Thấy "Bạn bè (2)", thứ tự "An Chi", "Bình"; mỗi hàng có ảnh, tên, email | SCR-08.A0, FLOW-06 bước 1–2, BR-27 |
| AC-2 | A đang mở tab Bạn bè; D có lời mời pending tới A | A chấp nhận lời mời của D (hoặc D chấp nhận lời mời của A ở máy khác) | D xuất hiện trong danh sách của A không cần tải lại; số "(n)" tăng | SCR-08.A0 (realtime), SUP-09 |
| AC-3 | A chưa có bạn | A mở tab Bạn bè | Hiện "Chưa có bạn bè" + nút "Thêm bạn" → mở SCR-07; hàng "Lời mời kết bạn" vẫn hiện | SCR-08 trạng thái Empty |
| AC-4 | A đang ở tab Bạn bè | Bấm "+ Thêm bạn" / hàng "Lời mời kết bạn" | Mở SCR-07 / SCR-09 | SCR-08.A3 |
| AC-5 | `friendships/{B_C}` (A không thuộc) | A truy vấn `friendships` không có điều kiện `member_uids` hoặc get doc `B_C` | permission-denied | NFR-13 |
| AC-6 | Listener lỗi | A mở tab Bạn bè | "Không tải được danh sách bạn" + "Thử lại"; bấm Thử lại khi đã có kết nối → tải được | SCR-08 trạng thái Error |

## 5. Test
### Unit / integration
| Case | Phủ AC |
|---|---|
| Hàm sắp xếp tên tiếng Việt (có dấu, hoa/thường): "an Chi" < "Bình" < "Đức" | AC-1 |
| Rules test: query `array-contains me` allow; get `friendships/B_C` bởi A deny; list không lọc deny | AC-5 |
| Component test (Vitest + Testing Library): 0 bạn → empty state; lỗi → error state | AC-3, AC-6 |

### E2E
| Kịch bản | Phủ AC |
|---|---|
| Playwright: seed A có 2 bạn → mở Bạn bè → kiểm thứ tự, email hiển thị | AC-1 |
| Playwright 2 context: A đang mở Bạn bè, B chấp nhận lời mời của A → hàng B xuất hiện | AC-2 |

### Dữ liệu seed / tiền điều kiện
- A `an@test.local`; B "Bình" `binh.tran@test.local`; C "An Chi" `chi@test.local` — `friendships` A–B, A–C; D `dung@test.local` có lời mời pending tới A; E `em@test.local` không có bạn.

### Test tay
| Bước | Thao tác | Kết quả mong đợi | AC |
|---|---|---|---|
| 1 | Đăng nhập A → tab Bạn bè | "Bạn bè (2)", "An Chi" trước "Bình", có email | AC-1 |
| 2 | Bấm "+ Thêm bạn", quay lại, bấm "Lời mời kết bạn" | Mở đúng SCR-07, SCR-09 | AC-4 |
| 3 | Ở SCR-09 chấp nhận lời mời của D, quay lại Bạn bè | D có trong danh sách, "(3)" | AC-2 |
| 4 | Đăng nhập E → tab Bạn bè | Trạng thái rỗng, nút "Thêm bạn" mở SCR-07 | AC-3 |
| 5 | Tắt Firestore emulator, mở lại tab Bạn bè; bật emulator, bấm Thử lại | Thông báo lỗi rồi tải được | AC-6 |

## 6. Definition of Done
- [ ] DoD chung (xem `backlog.md` mục 1)
- [ ] Index `idx_fs_member` khai báo và truy vấn chạy trên emulator
- [ ] Test rules cho truy vấn danh sách bạn

## 7. Ghi chú
- `[ASSUMED → Q-047]` Profile `deleted` còn sót trong `friendships` (trước khi `purgeAccount` dọn – T-026) hiện "Người dùng đã xóa".
- `[ASSUMED → Q-047]` Profile của bạn được cache trong phiên; đổi tên của bạn hiện sau khi mở lại màn (không listener từng profile) — chấp nhận ở MVP.
- Point 2 giữ nguyên.
