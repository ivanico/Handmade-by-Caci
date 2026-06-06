# Backend Skill — Shop CMS

This skill defines the code standards, folder structure, and architectural conventions for the Shop CMS backend. Always follow these rules when generating or modifying any backend code.

---

## 1. Code Quality

### Formatting & Indentation

* Use **4-space indentation** consistently across all files (Python standard).
* One statement per line.
* Avoid deeply nested conditions — use early returns.
* Trailing commas in multi-line function signatures and data structures.
* Always use type hints on all function signatures, return types, and class attributes.
* Never use `Any`. Use proper types, generics, or `Unknown` and narrow where needed.

### DRY Principle (Do Not Repeat Yourself)

* Extract any logic used more than once into a shared utility, service, or dependency.
* Never duplicate query logic across routers.
* Constants (strings, numbers, status values) belong in a dedicated module or `config.py`.
* Never hardcode reusable values inline.
* Shared types/schemas live in `schemas/` and are imported where needed.

### Naming Conventions

* Router functions: `snake_case` verb + noun
* Service functions: `snake_case` verb + noun
* Schema classes: `PascalCase` + `Create` / `Update` / `Out` suffix
* Model classes: `PascalCase` singular
* DB table names: `snake_case` plural
* Constants: `UPPER_SNAKE_CASE`
* Files should match the primary domain they serve.

Example:

```python
routers/products.py       # list_products, get_product, create_product
services/order.py         # create_order, get_by_order_number
schemas/product.py        # ProductCreate, ProductUpdate, ProductOut
models/product.py         # Product, ProductImage, ProductVariant, Category
```

---

## 2. Layer Architecture

### Modular, Separated Layers

* Each layer has a single responsibility.
* Business logic must not live in routers.
* DB queries must not live in routers.
* HTTP concerns must not live in services.

### Layer Responsibilities

#### Routers
* Parse HTTP request.
* Call service functions.
* Raise `HTTPException` when service returns `None` or raises `ValueError`.
* Return typed response.
* No SQL, no business logic.

#### Services
* Business logic only.
* Calls repositories for DB access.
* Calls other services when needed (email, image, cart).
* No FastAPI imports.
* No `HTTPException` — raise `ValueError` with a user-readable message.
* No direct DB queries — delegate to repositories.

#### Repositories
* DB queries only — SELECT, INSERT, UPDATE, DELETE.
* No business logic.
* Accept `AsyncSession` as argument.
* Return ORM objects or `None` — never raise HTTP errors.

#### Models
* SQLAlchemy ORM class definitions only.
* No business logic.
* No Pydantic.

#### Schemas
* Pydantic request/response models only.
* No ORM classes.
* No DB access.

#### Dependencies
* FastAPI `Depends` functions only.
* `get_db`, `current_user`, `require_admin`.

---

## 3. Folder Structure

```text
app/
├── main.py                  # FastAPI app init, CORS, router registration, static files
├── core/                    # app-wide config and infrastructure
│   ├── config.py            # pydantic-settings BaseSettings
│   ├── database.py          # engine, session factory, Base
│   ├── security.py          # JWT encode/decode, password hashing
│   ├── exceptions.py        # custom domain exception classes
│   └── constants.py         # LOW_STOCK_THRESHOLD, ORDER_NUMBER_PREFIX, etc.
├── dependencies/            # FastAPI Depends functions
│   ├── auth.py              # current_user, require_admin
│   ├── pagination.py        # common pagination params
│   └── common.py            # get_db
├── models/                  # SQLAlchemy ORM classes — one file per domain
│   ├── __init__.py          # imports all models so Alembic autogenerate sees them
│   ├── user.py
│   ├── product.py           # Product, ProductImage, ProductVariant, Category
│   └── order.py             # Order, OrderItem
├── schemas/                 # Pydantic request/response models — one file per domain
│   ├── auth.py
│   ├── product.py
│   ├── category.py
│   ├── cart.py
│   ├── order.py
│   └── common.py            # PaginatedResponse[T], ApiError
├── repositories/            # DB queries only — no business logic
│   ├── user_repository.py
│   ├── product_repository.py
│   ├── category_repository.py
│   ├── order_repository.py
│   └── cart_repository.py
├── services/                # Business logic — no FastAPI imports, no HTTP concerns
│   ├── auth_service.py
│   ├── product_service.py
│   ├── category_service.py
│   ├── order_service.py
│   ├── cart_service.py
│   ├── email_service.py
│   ├── image_service.py
│   └── payment_service.py   # stub only — returns not implemented
├── routers/                 # Route handlers grouped by domain
│   ├── auth.py
│   ├── products.py
│   ├── categories.py
│   ├── cart.py
│   ├── orders.py
│   └── admin/
│       ├── __init__.py
│       ├── products.py
│       ├── categories.py
│       ├── orders.py
│       └── stats.py
└── utils/                   # pure helper functions
    ├── slug.py
    ├── pagination.py
    ├── date.py
    └── files.py
```

### Folder Rules

| Folder | Allowed | Not Allowed |
|--------|---------|-------------|
| `routers/` | HTTP handling, calling services, raising HTTPException | Business logic, DB queries |
| `services/` | Business logic, calling repositories | FastAPI imports, HTTPException, direct DB queries |
| `repositories/` | DB queries only, return ORM objects or None | Business logic, HTTP concerns |
| `models/` | ORM class definitions | Business logic, Pydantic |
| `schemas/` | Pydantic models for I/O | ORM classes, DB access |
| `dependencies/` | FastAPI Depends functions | Business logic |
| `core/` | Config, DB engine, security, constants | Request handling, business logic |
| `utils/` | Pure helper functions | DB access, HTTP, React |

---

## 4. Routers

### All HTTP Handling Lives in Routers

Any logic involving:

* Parsing request body or query params
* Reading path parameters
* Raising `HTTPException`
* Setting response status codes
* Returning response schemas

must live in `routers/`.

### Router Naming

```python
list_products
get_product
create_product
update_product
delete_product
list_orders
update_order_status
```

### Router Guidelines

* Declare `response_model=` on every endpoint.
* Use `status_code=201` explicitly on creation endpoints.
* Admin routers apply `require_admin` at the router level — not per endpoint.
* Catch `ValueError` from services and re-raise as `HTTPException(status_code=400)`.
* Catch `None` returns from services and raise `HTTPException(status_code=404)`.

Example:

```python
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.dependencies import get_db, require_admin
from app.services import product as product_service
from app.schemas.product import ProductCreate, ProductOut
from app.schemas.common import PaginatedResponse

router = APIRouter(
    prefix='/api/admin/products',
    tags=['admin-products'],
    dependencies=[Depends(require_admin)],
)

@router.get('', response_model=PaginatedResponse[ProductOut])
async def list_products(
    search: str | None = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(24, le=48),
    db: AsyncSession = Depends(get_db),
):
    return await product_service.list_products(db, search, page, limit)

@router.post('', response_model=ProductOut, status_code=201)
async def create_product(
    data: ProductCreate,
    db: AsyncSession = Depends(get_db),
):
    try:
        return await product_service.create_product(db, data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
```

---

## 5. Services

### Service Responsibilities

* Business logic.
* DB queries.
* Redis operations.
* Email dispatch.
* Order number generation.
* Stock validation.

### Service Rules

* No FastAPI imports.
* No `HTTPException` — raise `ValueError` with a user-readable message.
* All DB writes inside `async with db.begin()`.
* Fire-and-forget tasks (email) with `asyncio.create_task()` after the transaction commits.
* Always return typed results.

Example:

```python
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.product import Product
from app.schemas.product import ProductCreate

async def create_product(
    db: AsyncSession,
    data: ProductCreate,
) -> Product:
    slug = generate_slug(data.name)

    existing = await db.execute(select(Product).where(Product.slug == slug))
    if existing.scalar_one_or_none():
        raise ValueError(f"A product with slug '{slug}' already exists")

    product = Product(**data.model_dump(), slug=slug)
    db.add(product)

    async with db.begin():
        await db.flush()
        await db.refresh(product)

    return product
```

---

## 6. Global Config (`config.py`)

### Single Source of Configuration

All environment variables must be read through:

```text
app/config.py
```

### Responsibilities

* Read `.env` via pydantic-settings.
* Expose a single `settings` instance imported everywhere.
* Never read `os.environ` directly anywhere else in the codebase.

Example:

```python
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    DATABASE_URL: str
    REDIS_URL: str
    JWT_SECRET: str
    JWT_ALGORITHM: str = 'HS256'
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    SMTP_HOST: str = ''
    SMTP_PORT: int = 587
    SMTP_USER: str = ''
    SMTP_PASSWORD: str = ''
    MAIL_FROM: str = ''
    ADMIN_EMAIL: str = ''
    MEDIA_DIR: str = '/srv/shop/media'
    FRONTEND_URL: str = 'http://localhost:5173'

    model_config = SettingsConfigDict(env_file='.env', extra='ignore')

settings = Settings()
```

### Rules

* Never use `os.environ` directly.
* Never create a second `Settings` class.
* Never duplicate config values across files.

---

## 7. Dependencies (`dependencies.py`)

### Single Source of Shared Dependencies

All reusable FastAPI dependencies must live in:

```text
app/dependencies.py
```

### Responsibilities

* Provide DB session (`get_db`).
* Decode and validate JWT (`current_user`).
* Enforce admin role (`require_admin`).

Example:

```python
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import AsyncSessionLocal
from app.models.user import User

bearer = HTTPBearer()

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session

async def current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer),
    db: AsyncSession = Depends(get_db),
) -> User:
    payload = decode_token(credentials.credentials)
    if not payload:
        raise HTTPException(status_code=401, detail='Invalid or expired token')
    user = await db.get(User, payload['sub'])
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail='User not found')
    return user

async def require_admin(user: User = Depends(current_user)) -> User:
    if user.role != 'admin':
        raise HTTPException(status_code=403, detail='Admin access required')
    return user
```

### Rules

* Never duplicate auth logic across routers.
* Never check roles inside individual route handlers — use `require_admin`.
* Apply `require_admin` at the `APIRouter` level, not per endpoint.

---

## 8. State & Error Handling

### Error Convention

| Situation | What to raise | Where |
|-----------|--------------|-------|
| Resource not found | `HTTPException(404)` | Router |
| Business rule failed | `ValueError(message)` | Service → caught in router as `400` |
| Unauthorized | `HTTPException(401)` | Dependency |
| Forbidden | `HTTPException(403)` | Dependency |
| Duplicate slug/email/SKU | `ValueError` → caught as `409` | Service → router |

Global handler in `main.py` catches unhandled `ValueError`:

```python
@app.exception_handler(ValueError)
async def value_error_handler(request, exc):
    return JSONResponse(status_code=400, content={'detail': str(exc)})
```

### Rules

* Avoid unnecessary global state.
* Keep DB session scoped to the request via `get_db`.
* Derived values (subtotal, total) must be computed — never stored redundantly.

---

## 9. Constants

### Rules

* No hardcoded status strings.
* No hardcoded numeric thresholds.
* No magic numbers.

Example:

```python
# Inside config.py or a constants module
LOW_STOCK_THRESHOLD = 5
CART_TTL_SECONDS = 60 * 60 * 24 * 7   # 7 days
ORDER_NUMBER_PREFIX = 'ORD'
MAX_PRODUCT_IMAGES = 8
```

---

## 10. Schemas

### Rules

* Separate schema classes for input and output — never reuse one for both.
* All `Update` schemas have every field optional.
* All response schemas set `model_config = {'from_attributes': True}`.
* Never expose `hashed_password` in any response schema.
* Use `Decimal` for all money fields — never `float`.

Example:

```python
from decimal import Decimal
from pydantic import BaseModel

class ProductCreate(BaseModel):
    name: str
    category_id: int
    description: str | None = None
    price: Decimal
    compare_at_price: Decimal | None = None
    sku: str
    stock_quantity: int = 0
    is_featured: bool = False
    is_active: bool = True

class ProductUpdate(BaseModel):
    name: str | None = None
    category_id: int | None = None
    price: Decimal | None = None
    compare_at_price: Decimal | None = None
    sku: str | None = None
    stock_quantity: int | None = None
    is_featured: bool | None = None
    is_active: bool | None = None

class ProductOut(BaseModel):
    id: int
    name: str
    slug: str
    price: Decimal
    stock_quantity: int
    is_active: bool
    is_featured: bool

    model_config = {'from_attributes': True}
```

---

## 11. Comments & Documentation

### Avoid Inline Comments

Do not add comments that explain obvious code behavior.

Bad:

```python
# Set loading to true
is_loading = True
```

Good:

```python
is_loading = True
```

### Allowed Comments

Comments are allowed only when:

* Explaining a non-obvious business rule.
* Documenting a workaround.
* Explaining a complex algorithm.
* Adding TODOs with context.

Example:

```python
# with_for_update() prevents overselling when two orders are placed simultaneously.
result = await db.execute(select(Product).where(Product.id == pid).with_for_update())
```

### Generated Code Rules

* Do not generate unnecessary comments.
* Do not add file header comments.
* Do not add section separator comments.
* Prefer clear naming over comments.

---

## 12. Performance

### Rules

* Use `selectin` loading on relationships to avoid N+1 queries.
* Paginate all list endpoints — never return unbounded queries.
* Use `with_for_update()` before any stock decrement.
* Fire-and-forget slow operations (email) with `asyncio.create_task()`.
* Use `flush()` inside transactions to get generated IDs without committing.

---

## 13. Testing Mindset

### Rules

Code should be structured to be testable:

* Business logic in services/utils.
* Routers focused on HTTP wiring.
* Avoid tightly coupling DB logic to HTTP handlers.
* Prefer dependency boundaries that are easy to mock (`get_db`, `current_user`).

---

## 14. Review Checklist

Before finalizing any backend code, verify:

* [ ] 4-space indentation
* [ ] No duplicated logic
* [ ] Logic extracted into services where appropriate
* [ ] Router responsibility is clear — HTTP only
* [ ] No SQL queries in routers
* [ ] No `HTTPException` in services — only `ValueError`
* [ ] All DB writes inside `async with db.begin()`
* [ ] All functions fully type-hinted
* [ ] No `Any` types
* [ ] Shared schemas live in `schemas/`
* [ ] All `Update` schemas have every field optional
* [ ] `hashed_password` never in any response schema
* [ ] Money fields use `Decimal` — never `float`
* [ ] `response_model=` declared on every endpoint
* [ ] Admin routers protected at router level, not per endpoint
* [ ] `settings` used everywhere — no direct `os.environ` reads
* [ ] Constants extracted — no magic numbers or hardcoded strings
* [ ] No unnecessary comments
* [ ] Clear naming instead of explanatory comments
* [ ] Email and other slow tasks use `asyncio.create_task()` after transaction
