---
name: bug-testing-guide
description: Use when you are about to test, fix bugs, debug, or verify behavior in the PVI Portal project. Provides the project-specific checklist and testing workflow.
---

# Bug Testing Guide — PVI Portal

## 1. Environment Checklist

- [ ] BE running (port 5000): `cd BE && npm start`
- [ ] FE running (port 3000): `cd FE && npm run dev`
- [ ] PostgreSQL running: `cd BE && npm run docker:up`
- [ ] DB seeded (5 users + 5 partners)

### Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@pvi.com.vn` | `123` |
| Partner | `momo@pvi.com.vn` | `123` |

### Smoke Test

- `GET /` → 200
- `POST /api/auth/login` → JWT token
- `GET /api/admin/accounts` with admin JWT → user list
- Swagger: `http://localhost:5000/api/docs`

---

## 2. Bug Pattern Catalog

### Authentication
- Login wrong email/password → 401 (no leak: "sai password" vs "email không tồn tại")
- Login with inactive account → 403
- Expired token → 401 → redirect login
- No token / bad token → 401
- Rate limit (10 req/15min) → 429

### Authorization
- Partner calls `/api/admin/*` → 403
- Check role guard everywhere

### CRUD (Accounts & Partners)
- Duplicate email → error
- Missing required fields → validation error
- Invalid email format → validation error
- ID not found → 404
- Delete partner linked to account → cascade or reject?
- Filter by status/role → correct

### Permission / Documents
- Create permission profile → endpoints saved correctly
- Assign profile to partner → partner sees correct APIs
- Override endpoint permission → override works
- Uncheck endpoint → partner can't see it
- Upload JSON / XML / YAML / Excel / DOCX → parses correctly
- Invalid format → clear error
- AI extract from DOCX/PDF/TXT → correct endpoints
- Empty file → error

### Sandbox
- Execute valid endpoint → mock data
- Execute invalid endpoint → error
- Form mode → params sent correctly
- Raw JSON mode → body sent correctly

### UI / UX
- Language switch EN ↔ VI → all text translated
- Sidebar navigation → correct category tree
- Loading state → spinner/skeleton
- Empty state → "Không có dữ liệu"
- Error state → user-friendly toast/alert
- Backend offline → localStorage fallback works

### Race Conditions
- Double-click submit → no duplicate
- Fast toggle permission → no state desync

---

## 3. API Quick Reference

### Auth
```
POST /api/auth/login  Body: { email, password }
  → 200: { token, role, name }
  → 401: { message, statusCode }
```

### Accounts
```
GET    /api/admin/accounts         → 200: User[]
POST   /api/admin/accounts         → 201: User
PUT    /api/admin/accounts/:id     → 200: User
DELETE /api/admin/accounts/:id     → 200/204
```

### Partners
```
GET    /api/admin/partners         → 200: Partner[]
POST   /api/admin/partners         → 201: Partner
PUT    /api/admin/partners/:id     → 200: Partner
DELETE /api/admin/partners/:id     → 200/204
```

### Documents
```
GET  /api/documents                → 200
GET  /api/documents/uploaded       → 200
POST /api/documents/upload         → 201
POST /api/documents/ai-extract     → 201
POST /api/admin/project-permission
POST /api/admin/endpoint-permission
```

### Sandbox
```
POST /api/sandbox/execute  Body: { method, path, headers?, body?, params?, mode? }
  → 200: { status, headers, body }
```

---

## 4. Test Flow for Bug Fix / New Feature

1. **Reproduce the bug** — confirm it exists
2. **Write failing test** (or document reproduction steps)
3. **Find root cause** — trace the data flow
4. **Fix** — single change, minimal
5. **Verify fix** — test passes, bug gone
6. **Regression check** — related features still work
7. **Edge cases**:
   - Empty/null input
   - Non-existent ID
   - Very long strings
   - Special characters / XSS attempts
8. **Run lint**: `cd FE && npx eslint src/` and `cd BE && npx eslint src/`

---

## 5. Cross-Cutting Concerns

- i18n: new text added to both EN and VI?
- Offline fallback: API fails → localStorage works?
- Loading/Error state: every async op handles all 3 states?
- Security: input validated? XSS prevented?
- Logging: enough info to debug?

---

## 6. curl Quick Test

```bash
# Login
curl -X POST http://localhost:5000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"admin@pvi.com.vn\",\"password\":\"123\"}"

# List accounts (replace TOKEN)
curl http://localhost:5000/api/admin/accounts ^
  -H "Authorization: Bearer TOKEN"
```

---

## 7. Commands

```bash
# BE
cd BE && npm start              # Start server
cd BE && npm test                # Unit tests
cd BE && npm run test:e2e        # E2E tests
cd BE && npm run docker:up       # Start PostgreSQL

# FE
cd FE && npm run dev             # Dev server (port 3000)
cd FE && npm run build           # Production build
```
