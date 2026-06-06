# Handmade by Caci — Project Overview

Ecommerce shop for handmade jewelry and decorations.

---

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, TypeScript, Tailwind CSS, Zustand, React Query |
| Backend | FastAPI, SQLAlchemy 2 Async, Alembic |
| Database | PostgreSQL 16 |
| Cache | Redis 7 (cart sessions) |
| Auth | JWT access token + httpOnly refresh cookie |
| Storage | Local disk `/srv/shop/media/` |
| Email | SMTP via fastapi-mail |

---

## Architecture

```
Frontend                     Backend
────────                     ───────
features/ (pages + api)  →   routers/
hooks/                   →   services/
store/ (zustand)             repositories/
                         →   models/ (SQLAlchemy)
                             PostgreSQL + Redis
```

**Key rules:**
- Routers handle HTTP only — no business logic
- Services contain business logic — no FastAPI imports
- Repositories contain DB queries — no business logic
- Frontend API calls live inside `features/{name}/api/` not in shared `api/`
- Server state via React Query; UI/auth state via Zustand

---

## Roles

| Role | Access |
|------|--------|
| `admin` | Full CRUD products/categories, all orders |
| `customer` | Browse, cart, place orders, own orders |
| `guest` | Browse, cart, place orders (no account needed) |

---

## Key Paths

| Thing | Path |
|-------|------|
| Backend app | `/srv/shop/backend/` |
| Frontend app | `/srv/shop/frontend/` |
| Media files | `/srv/shop/media/` |
| Backend env | `/srv/shop/backend/.env` |
| Frontend env | `/srv/shop/frontend/.env` |
| Sprint tasks | `TASKS/` |

---

## Documents

| File | Purpose |
|------|---------|
| `CLAUDE.md` | Sprint board — models, API conventions, task index |
| `FRONTEND_SKILL.md` | Frontend code standards and architecture |
| `BACKEND_SKILL.md` | Backend code standards and architecture |
| `DATABASE_SKILL.md` | DB conventions, query patterns, Redis rules |
| `TASKS/epic1-scaffold-auth.md` | Scaffold + auth tasks |
| `TASKS/epic2-products-categories.md` | Products + categories tasks |
| `TASKS/epic3-catalog-orders.md` | Catalog + cart + checkout tasks |
| `TASKS/epic4-admin-orders-ui.md` | Admin orders UI tasks |
| `TASKS/epic5-polish.md` | Polish + systemd tasks |
| `TASKS/epic6-acceptance.md` | Final acceptance checklist |
