# Online Shop CMS — Sprint Board

## Skills
Before writing any code read the relevant skill file:
- Frontend (React/TS/Tailwind): `FRONTEND_SKILL.md`
- Backend (FastAPI/Python): `BACKEND_SKILL.md`
- Database (PostgreSQL/SQLAlchemy/Redis): `DATABASE_SKILL.md`

---

## Environment: Oracle Linux VM (no Docker)
All services run natively via systemd.

### Dev commands
```
backend:  cd /home/vboxuser/Handmade-by-Caci/backend && source .venv/bin/activate && uvicorn app.main:app --reload --port 8000
frontend: cd /home/vboxuser/Handmade-by-Caci/frontend && npm run dev -- --port 5173
```

`.env` lives at `/home/vboxuser/Handmade-by-Caci/backend/.env` — never committed.

---

## Stack
- **Frontend**: React + TypeScript + Tailwind CSS (Vite)
- **Backend**: FastAPI (Python 3.11), virtualenv at `backend/.venv`
- **Database**: PostgreSQL 16, async via SQLAlchemy 2 + asyncpg, migrations via Alembic
- **Cache**: Redis 7, used for cart sessions only
- **Auth**: JWT — access token 15 min (JSON body), refresh token 7 days (httpOnly cookie)
- **File Storage**: local disk at `/home/vboxuser/Handmade-by-Caci/media/`, served by FastAPI `StaticFiles` at `/media/*`
- **Email**: SMTP via `fastapi-mail`
- **Payments**: stub only — endpoint returns 501; no payment library installed

---

## Roles
| Role | Can do |
|------|--------|
| `admin` | Full CRUD products/categories, view/search/sort/update all orders |
| `customer` | Browse catalog, cart, place orders, view own orders |
| `guest` | Browse catalog, cart, place orders (no account required) |

---

## Data Models — canonical schema, do not deviate

### Category
```
id            SERIAL PRIMARY KEY
name          VARCHAR(100) NOT NULL
slug          VARCHAR(100) UNIQUE NOT NULL
description   TEXT
image_url     VARCHAR(500)
parent_id     INTEGER REFERENCES categories(id) NULL
is_active     BOOLEAN DEFAULT true
created_at    TIMESTAMPTZ DEFAULT now()
```
Seed rows: `jewelry`, `gift-cards`, `wedding-decorations`, `home-decor`, `accessories`

### Product
```
id                SERIAL PRIMARY KEY
name              VARCHAR(200) NOT NULL
slug              VARCHAR(200) UNIQUE NOT NULL
description       TEXT
price             NUMERIC(10,2) NOT NULL
compare_at_price  NUMERIC(10,2) NULL
sku               VARCHAR(100) UNIQUE NOT NULL
stock_quantity    INTEGER NOT NULL DEFAULT 0
is_active         BOOLEAN DEFAULT true
is_featured       BOOLEAN DEFAULT false
category_id       INTEGER REFERENCES categories(id)
created_at        TIMESTAMPTZ DEFAULT now()
updated_at        TIMESTAMPTZ DEFAULT now()
```

### ProductImage
```
id          SERIAL PRIMARY KEY
product_id  INTEGER REFERENCES products(id) ON DELETE CASCADE
url         VARCHAR(500) NOT NULL
alt_text    VARCHAR(200)
sort_order  INTEGER DEFAULT 0
is_primary  BOOLEAN DEFAULT false
```

### ProductVariant
```
id             SERIAL PRIMARY KEY
product_id     INTEGER REFERENCES products(id) ON DELETE CASCADE
name           VARCHAR(100)
value          VARCHAR(100)
price_modifier NUMERIC(10,2) DEFAULT 0
stock_quantity INTEGER DEFAULT 0
```

### Cart (Redis key: `cart:{cart_id}`, TTL 604800s)
```json
{ "items": [{"product_id": 1, "variant_id": null, "quantity": 2}], "updated_at": "ISO8601" }
```

### Order
```
id               SERIAL PRIMARY KEY
order_number     VARCHAR(20) UNIQUE NOT NULL   -- ORD-2024-0001
customer_id      INTEGER REFERENCES users(id) NULL
customer_email   VARCHAR(200) NOT NULL
customer_name    VARCHAR(200) NOT NULL
customer_phone   VARCHAR(50)
shipping_address JSONB NOT NULL  -- {line1, line2, city, postal_code, country}
status           VARCHAR(30) DEFAULT 'pending'  -- pending|confirmed|processing|shipped|delivered|cancelled
payment_status   VARCHAR(20) DEFAULT 'unpaid'   -- unpaid|paid|refunded
notes            TEXT
total_amount     NUMERIC(10,2) NOT NULL
created_at       TIMESTAMPTZ DEFAULT now()
updated_at       TIMESTAMPTZ DEFAULT now()
```

### OrderItem
```
id            SERIAL PRIMARY KEY
order_id      INTEGER REFERENCES orders(id)
product_id    INTEGER REFERENCES products(id)
variant_id    INTEGER REFERENCES product_variants(id) NULL
product_name  VARCHAR(200) NOT NULL   -- snapshot
product_sku   VARCHAR(100) NOT NULL   -- snapshot
unit_price    NUMERIC(10,2) NOT NULL  -- snapshot
quantity      INTEGER NOT NULL
subtotal      NUMERIC(10,2) NOT NULL
```

### User
```
id              SERIAL PRIMARY KEY
email           VARCHAR(200) UNIQUE NOT NULL
hashed_password VARCHAR(200) NOT NULL
full_name       VARCHAR(200)
phone           VARCHAR(50)
role            VARCHAR(20) DEFAULT 'customer'  -- admin|customer
is_active       BOOLEAN DEFAULT true
created_at      TIMESTAMPTZ DEFAULT now()
```

---

## API Conventions
- Base URL: set via `VITE_API_BASE_URL` env var in frontend (dev: `http://localhost:8000`, prod: your actual domain)
- Public routes: `/api/*`
- Admin routes: `/api/admin/*` — `require_admin` dependency on the router, not per endpoint
- Pagination: `?page=1&limit=24` → `{items, total, page, pages}`
- Errors: always `{"detail": "message"}` with correct HTTP status
- Slugs: auto-generated from name (lowercase, spaces→hyphens, strip special chars); unique enforced at DB level

---

## Tasks
Epics are in the `TASKS/` folder. Work through them in order, one task at a time.

| File | Content |
|------|---------|
| `TASKS/epic1-scaffold-auth.md` | Project scaffold, DB, auth endpoints, frontend auth shell |
| `TASKS/epic2-products-categories.md` | Product & category API + admin UI |
| `TASKS/epic3-catalog-orders.md` | Customer catalog, cart, checkout, order flow |
| `TASKS/epic4-admin-orders-ui.md` | Admin orders table and detail page |
| `TASKS/epic5-polish.md` | Loading states, responsive, stock guard, payment stub, systemd |
| `TASKS/epic6-acceptance.md` | Final acceptance checklist — run after all epics complete |
