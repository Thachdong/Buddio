# T-029 · Responsive desktop & kiểm trình duyệt

| Epic | Milestone | Point | Phụ thuộc | Trạng thái |
|---|---|---|---|---|
| EPIC-07 | M5 | 5 | T-022, T-024 | TODO |

## 1. Mục tiêu demo
Sau task này: **Người dùng mở Buddio ở 1280px → thấy sidebar trái 4 mục, mục Phòng có danh sách phòng + khung chat cạnh nhau, Thông tin phòng là panel phải, Thêm bạn / Tạo phòng dạng dialog; trong ô nhập desktop Enter gửi, Shift+Enter xuống dòng. Playwright smoke chạy xanh trên Chromium, Firefox, WebKit (viewport iPhone / iOS Safari); vùng chạm ≥44px.**

## 2. Phạm vi
| Loại | ID | Ghi chú |
|---|---|---|
| Thao tác | Layout chung | wireframe.md mục 5: mobile (360–767), tablet (768–1023, nội dung tối đa 720px), desktop (≥1024) |
| Thao tác | SCR-03 + SCR-05 | 2 cột trên desktop; chưa chọn phòng → "Chọn một phòng để bắt đầu trò chuyện" |
| Thao tác | SCR-06 | Panel trượt phải ~360px |
| Thao tác | SCR-04, SCR-07 | Dialog lớn (~560×720, ~480×560) |
| Thao tác | SCR-08/09/10/11/12 | Vùng nội dung giới hạn rộng (720 / 560px) theo ghi chú desktop từng màn |
| API | — | |
| Dữ liệu | — | |
| NFR | NFR-22 | Dùng đầy đủ từ 360px; gửi tin ≤2 chạm; mời bạn ≤3 bước |
| NFR | NFR-23 (Could) | Vùng chạm ≥44×44px; tương phản WCAG 2.1 AA (axe) |
| NFR | NFR-25 | Chrome, Edge, Firefox, Safari 2 bản mới nhất; Safari iOS 16+; Chrome Android |
| Khác | Q-044 | Enter gửi (desktop), Shift+Enter xuống dòng; mobile Enter xuống dòng |

**Ngoài phạm vi:** kiểm thủ công trên thiết bị iOS / Android thật (ghi chú). (Kéo-thả ảnh desktop đã đưa vào task này – Q-047.)

## 3. Việc cần làm
### UI
- [ ] Layout gốc theo breakpoint Tailwind: `<1024px` thanh tab dưới (hiện có); `≥1024px` sidebar trái 4 mục (Phòng, Bạn bè, Thông báo, Cài đặt) giữ nguyên badge (LAYOUT.A2/A3); tablet `768–1023` nội dung giới hạn 720px, giữa màn.
- [ ] Mục Phòng desktop: route `/rooms` và `/rooms/[roomId]` render chung layout 2 cột — SCR-03 cột trái ~360px, SCR-05 bên phải; chưa chọn phòng → "Chọn một phòng để bắt đầu trò chuyện"; hàng phòng đang mở được tô nền; nút ← của SCR-05 ẩn trên desktop.
- [ ] SCR-06 desktop: panel trượt phải ~360px cạnh khung chat (ℹ / bấm tên phòng mở, × đóng); dialog con hiển thị giữa màn.
- [ ] SCR-04, SCR-07 desktop: mở dạng dialog lớn phủ lên màn hiện tại (intercepting / parallel route hoặc component dialog `[ASSUMED → Q-047]`), đóng bằng × / Esc, URL vẫn chia sẻ được.
- [ ] SCR-08/09/10/11/12 desktop: vùng nội dung giới hạn chiều rộng theo ghi chú từng màn; SCR-09, SCR-12 có nút quay lại trong vùng nội dung.
- [ ] Ô nhập SCR-05: khi `matchMedia('(min-width: 1024px) and (pointer: fine)')` → Enter gửi (nếu nút Gửi đang bật), Shift+Enter xuống dòng; bỏ qua Enter khi đang gõ IME (`isComposing`) `[ASSUMED → Q-047]`; mobile giữ Enter = xuống dòng.
- [ ] Rà vùng chạm: mọi button / icon button / hàng danh sách ≥44×44px (padding / `min-h-11 min-w-11`).
- [ ] Sửa lỗi tương phản phát hiện bởi axe (màu chữ phụ, chữ trên badge).
- [ ] Kéo-thả ảnh vào khung chat SCR-05 trên desktop (Q-047): vùng thả hiện viền + "Thả ảnh để gửi"; tệp thả vào đi chung luồng chọn ảnh của T-019 (upload tạm, kiểm ≤10 ảnh / ≤10MB / chỉ ảnh – BR-21); phòng chỉ đọc → không nhận thả.
- [ ] Kiểm Safari: `100dvh` cho thanh soạn tin dính đáy khi bàn phím iOS mở, `-webkit-` cho textarea tự giãn, `env(safe-area-inset-bottom)`.

### API / Backend
- [ ] Không có.

### Data
- [ ] Không có.

### Khác
- [ ] `playwright.config.ts`: projects `mobile-chromium` (375×812, hiện có), `desktop-chromium` (1280×800), `desktop-firefox` (1280×800), `mobile-webkit` (`devices['iPhone 13']`), `desktop-webkit` (1280×800) `[ASSUMED → Q-047]`; Edge = Chromium (không chạy riêng).
- [ ] Bộ smoke chạy trên mọi project: đăng nhập (Auth emulator) → danh sách phòng → mở phòng → gửi tin → thấy tin; Thêm bạn → tra email → gửi lời mời.
- [ ] `@axe-core/playwright` chạy trên SCR-03, SCR-05, SCR-07, SCR-08, SCR-10, SCR-11 (mobile + desktop), rule `color-contrast` phải pass.
- [ ] Helper `assertTouchTargets(page)` đo `boundingBox()` mọi phần tử `button, a, [role=button], input[type=checkbox], [role=switch]` đang hiển thị → ≥44×44 (mobile).
- [ ] CI: matrix browser cho job Playwright (cài `npx playwright install --with-deps`).

## 4. Acceptance criteria
| # | Given | When | Then | Nguồn |
|---|---|---|---|---|
| AC-1 | Viewport 1280×800, đã đăng nhập, có ≥2 phòng | Mở `/rooms` | Sidebar trái 4 mục có badge, không có thanh tab dưới; cột danh sách phòng ~360px; bên phải "Chọn một phòng để bắt đầu trò chuyện" | wireframe mục 5, SCR-03 mục 5 |
| AC-2 | Như AC-1 | Bấm một phòng | Khung chat SCR-05 hiện bên phải, danh sách phòng vẫn hiện, hàng phòng được tô; URL `/rooms/{id}` | wireframe mục 5 |
| AC-3 | Đang mở phòng ở desktop | Bấm ℹ | SCR-06 là panel bên phải ~360px, khung chat vẫn thấy; × đóng panel | SCR-06 mục 5 |
| AC-4 | Desktop | Bấm "+ Tạo phòng" / "Thêm bạn" | Mở dialog lớn trên màn hiện tại; Esc đóng; danh sách phòng vẫn ở dưới | SCR-04, SCR-07 mục 5 |
| AC-5 | Desktop, ô nhập có "Xin chào" | Nhấn Enter / Shift+Enter | Enter: tin được gửi, ô trống; Shift+Enter: thêm dòng mới, không gửi | Q-044, SCR-05 mục 5 |
| AC-6 | Mobile 375×812 | Nhấn Enter trong ô nhập | Xuống dòng, không gửi; gửi bằng nút Gửi; từ lúc mở phòng gửi tin ≤2 chạm (chạm ô nhập, chạm Gửi) | NFR-22, SCR-05 mục 5 |
| AC-7 | Viewport 360×740 và 800×1000 | Duyệt SCR-03, SCR-05, SCR-07, SCR-08, SCR-11 | Không có thanh cuộn ngang, không phần tử bị cắt; tablet nội dung ≤720px | NFR-22, wireframe mục 5 |
| AC-8 | Bộ smoke Playwright | Chạy trên `mobile-chromium`, `desktop-chromium`, `desktop-firefox`, `mobile-webkit`, `desktop-webkit` | Tất cả xanh trên CI | NFR-25 |
| AC-9 | Mobile 375×812 | `assertTouchTargets` trên SCR-03, SCR-05, SCR-08, SCR-10, SCR-11 | Mọi phần tử tương tác ≥44×44px | NFR-23 |
| AC-10 | Mobile và desktop | axe trên 6 màn | 0 vi phạm `color-contrast` | NFR-23 |
| AC-11 | `mobile-webkit` (iPhone 13) | Mở phòng, focus ô nhập | Thanh soạn tin dính đáy, không bị che; danh sách tin cuộn được | NFR-25, NFR-22 |
| AC-13 | Desktop, phòng đang chat được | Kéo 2 ảnh từ máy vào khung chat rồi thả | Vùng thả hiện viền khi kéo qua; 2 ảnh vào khay xem trước như khi chọn bằng nút; thả 11 ảnh / tệp PDF → báo lỗi như SCR-05.A5 | Q-047, SCR-05 mục 5, BR-21 |
| AC-12 | Desktop | Từ danh sách phòng mời bạn: Thêm bạn → nhập email → Tìm → Gửi lời mời | Hoàn tất trong ≤3 bước tương tác chính | NFR-22 |

## 5. Test
### Unit / integration
| Case | Phủ AC |
|---|---|
| Component test ô nhập: `desktop=true` Enter → gọi `onSend`; Shift+Enter → không gọi; `isComposing` → không gọi; `desktop=false` Enter → không gọi | AC-5, AC-6 |
| Hook `useBreakpoint` trả đúng mobile / tablet / desktop theo `matchMedia` mock | AC-1, AC-7 |

### E2E
| Kịch bản | Phủ AC |
|---|---|
| `desktop-chromium`: layout 2 cột, mở phòng, panel SCR-06, dialog SCR-04 / SCR-07, Enter gửi | AC-1 → AC-5, AC-12 |
| Smoke chung trên 5 project | AC-8, AC-11 |
| Kiểm không cuộn ngang (`document.documentElement.scrollWidth <= innerWidth`) ở 360 và 800px | AC-7 |
| `assertTouchTargets` + axe `color-contrast` | AC-9, AC-10 |
| `mobile-chromium`: Enter xuống dòng, đếm chạm gửi tin | AC-6 |
| `desktop-chromium`: giả lập `drop` với `DataTransfer` 2 ảnh → khay xem trước; 11 ảnh → lỗi | AC-13 |

### Dữ liệu seed / tiền điều kiện
- Seed T-009 → T-024: tài khoản A có ≥3 phòng, ≥2 bạn, ≥1 thông báo, ≥1 lời mời đang chờ.

### Test tay
| Bước | Thao tác | Kết quả mong đợi | AC |
|---|---|---|---|
| 1 | Chrome 1280px, đăng nhập A | Sidebar, 2 cột, "Chọn một phòng…" | AC-1 |
| 2 | Bấm phòng, bấm ℹ | Khung chat + panel phải | AC-2, AC-3 |
| 3 | Bấm "+ Tạo phòng", Esc; bấm "Thêm bạn" | Dialog mở / đóng đúng | AC-4 |
| 4 | Gõ "Xin chào", Shift+Enter, gõ "bạn", Enter | Tin 2 dòng được gửi | AC-5 |
| 5 | DevTools device iPhone SE (375) → mở phòng → Enter | Xuống dòng; gửi bằng nút | AC-6 |
| 6 | Kéo cửa sổ về 360px và 800px qua các màn | Không cuộn ngang; tablet nội dung ≤720px | AC-7 |
| 7 | Mở app trên Firefox và Safari (macOS) bản mới nhất, chạy luồng smoke tay | Hoạt động như Chrome | AC-8 |
| 9 | Kéo 2 ảnh từ Finder vào khung chat (Chrome desktop) → Gửi | Ảnh vào khay rồi gửi được | AC-13 |
| 8 | Nếu có iPhone (iOS 16+) cùng mạng LAN: mở app qua IP máy dev, focus ô nhập | Thanh soạn không bị bàn phím che | AC-11 |

## 6. Definition of Done
- [ ] DoD chung (xem `backlog.md` mục 1)
- [ ] CI chạy Playwright trên 5 project, tất cả xanh
- [ ] Ảnh chụp desktop 1280px các màn chính đính kèm PR

## 7. Ghi chú
- `[ASSUMED → Q-047]` Enter gửi áp khi viewport ≥1024px **và** con trỏ `fine` (tránh tablet có bàn phím ảo); bỏ qua khi đang gõ IME tiếng Việt (`isComposing`) để không gửi nhầm khi bộ gõ Telex / VNI đang chờ.
- `[ASSUMED → Q-047]` Edge kiểm qua project Chromium; Chrome Android và Safari iOS thật kiểm tay nếu có thiết bị — WebKit của Playwright chỉ gần đúng với Safari iOS.
- `[ASSUMED → Q-047]` SCR-04 / SCR-07 trên desktop làm bằng intercepting route của Next.js để URL vẫn chia sẻ được; chọn cách khác nếu đơn giản hơn.
- Kéo-thả ảnh vào khung chat trên desktop (SCR-05 mục 5) chưa thuộc task nào → đề xuất thêm vào task này (+1 điểm) hoặc ghi nhận sau MVP.
- **Đề xuất point: 5 (sơ bộ 3).** Task chạm layout của cả 12 màn (sidebar, 2 cột, panel, dialog, giới hạn rộng), thêm 4 project trình duyệt vào CI, axe và kiểm vùng chạm, xử lý riêng Safari iOS. Giữ 3 trong file theo slices.md.
