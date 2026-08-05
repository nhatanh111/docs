# TEST PLAN & BUG TESTING GUIDE - PVI Portal (Combined)

Phiên bản: 1.0
Ngày tạo: 29/07/2026
Mục đích: Hợp nhất hai tài liệu hướng dẫn kiểm thử hiện có (Bug Testing Guide & Test Plan - Admin Dashboard) thành một file hoàn chỉnh, dễ đọc và sẵn sàng cho QA thực thi thủ công hoặc chuyển sang test automation.

---

## MỤC LỤC

1. Mô tả & Mục tiêu
2. Trước khi test (Pre-checks)
3. Smoke tests nhanh
4. Bug Pattern Catalog (những loại bug hay gặp)
5. API Contract & Quick curl
6. Test Cases (chi tiết theo module)
   - Authentication
   - AccountsTab
   - PartnersTab
   - PermissionsTab
   - useApiDocs (API Docs integration)
   - Sandbox / Mock API
   - UI / UX / Accessibility
   - Security
   - Performance
   - Compatibility
   - Edge / Boundary Cases
7. Dữ liệu kiểm thử (Test Data)
8. Entry / Exit Criteria, Priority & Severity
9. Bộ Regression bắt buộc
10. Quick Commands & Ghi chú vận hành

---

## 1. MÔ TẢ & MỤC TIÊU

Đảm bảo Admin Dashboard (Accounts, Partners, Permissions) hoạt động chính xác, an toàn, ổn định. Trọng tâm:
- Luồng phân quyền (Permissions) phải chính xác — sai sót dẫn đến cấp/thu hồi sai quyền.
- Hook `useApiDocs` phải xử lý response không phải JSON (401/403 dạng text/HTML) một cách an toàn (không throw parse error).
- Kiểm tra bảo mật kỹ do JWT được lưu trong `localStorage`.

Đối tượng sử dụng: QA, Test Lead, Developer viết test tự động.

---

## 2. TRƯỚC KHI TEST

- [ ] Backend đang chạy (port 5000) — `cd BE && npm start`
- [ ] Frontend đang chạy (port 3000) — `cd FE && npm run dev`
- [ ] PostgreSQL đang chạy nếu cần — `cd BE && npm run docker:up`
- [ ] Database đã seed (ít nhất: 5 users + 5 partners)
- Test accounts chuẩn sẵn:
  - Admin: `admin@pvi.com.vn` / `123`
  - Partner 1: `momo@pvi.com.vn` / `123`
  - Partner 2: `vifo@pvi.com.vn` / `123`

---

## 3. SMOKE TESTS NHANH

- [ ] GET / → 200 "Hello World"
- [ ] POST /api/auth/login với email/password đúng → trả về JWT
- [ ] GET /api/admin/accounts (với JWT admin) → 200 + danh sách
- [ ] Swagger docs mở được: `http://localhost:5000/api/docs`

---

## 4. BUG PATTERN CATALOG (TỔNG QUAN)

Các nhóm bug chính cần chú ý:
- Authentication: user enumeration, 401/403 handling, token expiry handling, rate-limit
- Authorization: partner gọi API admin, admin gọi partner APIs, xóa admin cuối cùng
- CRUD bugs: create/update/delete validation, duplicate email, pagination
- Permissions / Documents: upload/parse file, assign permissions, override/merge rules
- useApiDocs failures: non-JSON responses, 401/403, cold starts
- UI/UX: translations, responsive, loading states
- Security: XSS, SQLi, IDOR, token leakage
- Race conditions: double-submit, concurrent edits

---

## 5. API CONTRACT & QUICK curl

Base URL: `http://localhost:5000`

Auth example:
```
POST /api/auth/login
Body: { email, password }
→ 200: { access_token, user: { id, email, role } }
→ 401: { message, statusCode }
```

Accounts endpoints:
```
GET    /api/admin/accounts
POST   /api/admin/accounts
PUT    /api/admin/accounts/:id
DELETE /api/admin/accounts/:id
```

Partners endpoints:
```
GET    /api/admin/partners
POST   /api/admin/partners
PUT    /api/admin/partners/:id
DELETE /api/admin/partners/:id
```

Documents / Permissions / Sandbox:
```
POST /api/documents/upload
POST /api/documnets/ai-extract
POST /api/admin/endpoint-permission
POST /api/sandbox/execute
```

Curl quick:
```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@pvi.com.vn","password":"123"}'

# List accounts (thay TOKEN)
curl http://localhost:5000/api/admin/accounts \
  -H "Authorization: Bearer <TOKEN>"
```

---

## 6. TEST CASES (CHI TIẾT)

Lưu ý: Mỗi test case gồm: ID, Mục tiêu, Các bước thực hiện, Kết quả mong đợi, Priority, Type.

### Authentication (AUTH)

- AUTH-001: Đăng nhập hợp lệ → JWT lưu `localStorage`, chuyển dashboard. (P0)
- AUTH-002: Đăng nhập sai mật khẩu → lỗi chung, không lưu token. (P0)
- AUTH-003: Email không tồn tại → lỗi giống AUTH-002 (chống user enumeration). (P1)
- AUTH-006: Xóa token thủ công giữa phiên → App xử lý 401, redirect login, không crash. (P0)
- AUTH-007: Token hết hạn → 401 → tự logout/redirect; không .json() response lỗi dạng text. (P0)
- AUTH-009: Đăng xuất → token xóa, back-button không vào lại trang auth-protected. (P0)
- AUTH-010: Đăng xuất đa tab → kiểm tra đồng bộ trạng thái giữa các tab. (P2)

### AccountsTab (ACC)

- ACC-001: Tạo tài khoản hợp lệ → hiển thị trong list. (P0)
- ACC-002: Tạo trùng email → lỗi trùng. (P1)
- ACC-004: Sửa thông tin → cập nhật đồng bộ UI. (P1)
- ACC-006: Tự vô hiệu hóa tài khoản đang đăng nhập → hệ thống chặn hoặc force-logout. (P1)
- ACC-009: Reset mật khẩu khác → gửi request/email, không lộ mật khẩu. (P1)

### PartnersTab (PARTNER)

- PARTNER-001: Tạo đối tác hợp lệ. (P0)
- PARTNER-004: Tên có dấu/ký tự đặc biệt → lưu & hiển thị đúng. (P2)
- PARTNER-007: Xóa/vô hiệu hóa partner có quyền active → cảnh báo/thu hồi quyền. (P0)
- PARTNER-013: Đồng thời sửa 2 admin → xử lý conflict. (P2)

### PermissionsTab (PERM) — module lõi

- PERM-001..PERM-017: (Xem danh sách cụ thể trong tài liệu gốc)
- PERM-003: Gán endpoint cho 1 partner → lưu & API thực tế phản ánh. (P0)
- PERM-004: Thu hồi quyền → partner không còn gọi được endpoint. (P0)
- PERM-009..PERM-014: Upload file (valid/invalid/empty/oversize/overwrite) — test kỹ theo rule ghi đè/merge. (P0..P2)
- PERM-017: Sau Save, verify bằng Postman/API call rằng quyền thực tế khớp UI. Đây là test quan trọng nhất. (P0)

### useApiDocs / API Docs (DOCS)

- DOCS-001: Token hết hạn khi tải docs → hook kiểm tra status trước khi .json(), hiển thị lỗi thân thiện. (P0)
- DOCS-002: Chưa đăng nhập gọi docs → 401 xử lý gracefully. (P0)
- DOCS-003: Backend trả 403 → hiển thị "không đủ quyền" thay vì blank/crash. (P0)
- DOCS-005: Backend trả dữ liệu thiếu field → hook fallback/empty state. (P1)
- DOCS-008: Không gọi API dư thừa khi re-render. (P2)

### Sandbox / Mock API

- Execute sandbox với endpoint hợp lệ → trả mock data. (P1)
- Execute không tồn tại → trả error. (P1)
- Form vs Raw JSON mode → gửi params đúng. (P1)

### UI / UX / Accessibility

- Responsive, translations EN/VI, loading states, empty states, dialogs confirm delete — test across browsers & viewport sizes. (P1..P2)
- UI-009: Contrast badges theo WCAG AA. (P2)

### Security (SEC)

- SEC-001..SEC-014: XSS Stored/Reflected, SQL Injection, IDOR, CSRF, token leakage, alg=none JWT → test priority cao. (P0..P2)

### Performance (PERF)

- PERF-001: LCP <3s network 4G (P1)
- PERF-002: List APIs large dataset performance (P1)
- PERF-004: useApiDocs cold start handling (P1)

### Compatibility & Edge Cases

- COMP-001..COMP-004: Browsers/Resolutions. (P2..P3)
- EDGE series: network loss during save, double submit, very long inputs, paste hidden chars, VITE_API_URL misconfig. (P1..P3)

---

## 7. DỮ LIỆU KIỂM THỬ (TEST DATA)

- Accounts: 1 admin full, 1 limited, 1 disabled
- Partners: Active, Inactive, names with VN diacritics and special chars
- Tokens: valid, expired, tampered
- Files for upload: valid JSON/YAML, invalid, empty, oversize, bad-syntax
- Payloads for security: `<script>alert(1)</script>`, `' OR '1'='1`, `../../etc/passwd`

---

## 8. ENTRY / EXIT CRITERIA, PRIORITY & SEVERITY

Entry:
- Build deployed to test; BA/PO xác nhận spec PermissionsTab, rule override/merge khi upload file.

Exit:
- 100% P0 test pass; không còn Blocker/Critical; P1 được risk-accept hoặc fixed.

Severity mapping: Blocker / Critical / Major / Minor (tham khảo trong tài liệu gốc).

---

## 9. BỘ REGRESSION ĐỀ XUẤT (RUN TRƯỚC TIÊN)

- AUTH-006, AUTH-007, DOCS-001, DOCS-002, DOCS-003,
- PERM-003, PERM-004, PERM-017,
- SEC-001, SEC-004, SEC-014

(Chạy các test này trước mỗi release.)

---

## 10. QUICK COMMANDS & GHI CHÚ VẬN HÀNH

# Backend
cd BE
npm start              # Start server
npm test               # Run unit tests
npm run test:e2e       # Run E2E tests
npm run docker:up      # Start PostgreSQL

# Frontend
cd FE
npm run dev            # Start dev server (port 3000)
npm run build          # Build production

Gợi ý QA:
- Dùng Postman/Newman để chạy API contract tests.
- Dùng Cypress/Playwright để tự động hóa UI các test P0/P1.
- Dùng Lighthouse & OWASP ZAP cho performance + security scan.

---

## GHI CHÚ CUỐI

- File này là bản hợp nhất để QA dùng làm single source of truth cho test manual và làm cơ sở cho tự động hóa. Nếu có rule nghiệp vụ chi tiết (ví dụ: ghi đè hay merge khi upload permission file), cần cập nhật PERM-014 cụ thể theo BA/PO và ghi lại trong phần "Assumptions".
- Security note: JWT lưu trong localStorage có rủi ro XSS — tăng cường sanitize & CSP.

---

*File được tạo tự động từ nội dung hai tài liệu gốc: BUG_TESTING_GUIDE.md và test-plan-admin-dashboard.md. Nếu muốn export sang TestRail/Xray/CSV để import, báo mình sẽ xuất theo định dạng phù hợp.*
