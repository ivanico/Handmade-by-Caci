# Database Skill — Shop CMS

This skill defines the conventions for models, migrations, queries, and Redis usage in the Shop CMS. Always follow these rules when generating or modifying any database-related code.

---

## 1. Code Quality

### Formatting & Style

* Use **4-space indentation** (Python standard).
* Always use type hints on all function signatures and return types.
* Never use `Any`.
* One import per line in model files.
* Column definitions one per line — never inline multiple columns.

### DRY Principle

* All models import `Base` from `app.database` — never define a second `Base`.
* All models registered in `models/__init__.py` — never import them elsewhere individually for Alembic.
* Shared column patterns (timestamps, soft delete) must be consistent across all models — copy the exact same pattern, do not invent variations.

### Naming Conventions

* Model classes: `PascalCase` singular
* Table names: `snake_case` plural
* Column names: `snake_case`
* Index names: `ix_{table}_{column}`
* Foreign key columns: `{referenced_table_singular}_id`

Example:

```python
class ProductImage(Base):
    __tablename__ = 'product_images'

    id = Column(Integer, primary_key=True)
    product_id = Column(Integer, ForeignKey('products.id'), nullable=False)
```

---

## 2. Model Architecture

### Modular, Single-Responsibility Models

* One file per domain group — not one file per table.
* Business logic must not live in model methods — models are pure data structures.
* No Pydantic in model files.

```text
models/
├── __init__.py      # imports all models so Alembic autogenerate sees them
├── user.py          # User
├── product.py       # Category, Product, ProductImage, ProductVariant
└── order.py         # Order, OrderItem
```

### Model Responsibilities

#### Model class
* Column definitions.
* Relationship declarations.
* Table args (indexes, constraints).
* Nothing else.

#### `__init__.py`
* Imports every model class.
* Must be updated whenever a new model is added.

```python
# models/__init__.py
from app.models.user import User
from app.models.product import Category, Product, ProductImage, ProductVariant
from app.models.order import Order, OrderItem
```

---

## 3. Folder Structure

```text
app/
├── database.py          # engine, AsyncSessionLocal, Base
└── models/
    ├── __init__.py
    ├── user.py
    ├── product.py
    └── order.py

migrations/
├── env.py
├── script.py.mako
└── versions/
    ├── 0001_initial_schema.py
    └── 0002_add_is_featured_to_products.py
```

### Folder Rules

| Folder | Allowed | Not Allowed |
|--------|---------|-------------|
| `models/` | ORM class definitions, relationships, indexes | Business logic, Pydantic, queries |
| `migrations/` | Alembic migration files | Application logic, model imports beyond `env.py` |
| `database.py` | Engine, session factory, Base | Model definitions |

---

## 4. Column Types

### Always use the correct type — never approximate

| Data | SQLAlchemy type | Notes |
|------|----------------|-------|
| Money / price | `Numeric(10, 2)` | Never `Float` — floats lose precision |
| Short text | `String(N)` | Always set a max length |
| Long text | `Text` | No length limit |
| Timestamps | `TIMESTAMPTZ` | Always with timezone |
| Status strings | `String(30)` | Store as string, validate in Pydantic schema |
| JSON blobs | `JSONB` | e.g. `shipping_address` |
| Booleans | `Boolean` | Always set `default=` |
| Primary keys | `Integer, primary_key=True` | Auto-increment |

```python
from sqlalchemy.dialects.postgresql import JSONB, TIMESTAMPTZ
```

### Timestamp pattern — always DB-side defaults

```python
created_at = Column(TIMESTAMPTZ, server_default=func.now(), nullable=False)
updated_at = Column(TIMESTAMPTZ, server_default=func.now(), onupdate=func.now(), nullable=False)
```

Never use `default=datetime.now` (Python-side) — inconsistent across timezones.

---

## 5. Relationships

### Guidelines

* Use `lazy='selectin'` on relationships that are always included in responses — avoids N+1.
* Use `cascade='all, delete-orphan'` on child relationships (images, variants, order items).
* Always declare `back_populates` on both sides of a relationship.

Example:

```python
# product.py
class Product(Base):
    __tablename__ = 'products'

    category = relationship('Category', back_populates='products', lazy='selectin')
    images = relationship(
        'ProductImage',
        back_populates='product',
        order_by='ProductImage.sort_order',
        cascade='all, delete-orphan',
        lazy='selectin',
    )
    variants = relationship(
        'ProductVariant',
        back_populates='product',
        cascade='all, delete-orphan',
        lazy='selectin',
    )
```

---

## 6. Indexes

Add indexes for every column used in `WHERE` or `ORDER BY` on tables that grow with usage.

```python
class Product(Base):
    __tablename__ = 'products'

    __table_args__ = (
        Index('ix_products_slug', 'slug', unique=True),
        Index('ix_products_category_id', 'category_id'),
        Index('ix_products_is_active', 'is_active'),
        Index('ix_products_is_featured', 'is_featured'),
    )

class Order(Base):
    __tablename__ = 'orders'

    __table_args__ = (
        Index('ix_orders_order_number', 'order_number', unique=True),
        Index('ix_orders_customer_email', 'customer_email'),
        Index('ix_orders_status', 'status'),
        Index('ix_orders_created_at', 'created_at'),
    )
```

---

## 7. Alembic Migrations

### Migration Rules

* Always autogenerate: `alembic revision --autogenerate -m "description"`
* Review the generated file before running — autogenerate misses custom indexes and `server_default` changes on existing rows.
* Never hand-write SQL inside `upgrade()` unless it's a data migration with no ORM equivalent.
* Never import application code inside a migration's `upgrade()` / `downgrade()`.
* One migration per logical change — don't batch unrelated changes.
* Never edit a migration that has already been applied to production.

### Migration naming

```text
0001_initial_schema.py
0002_add_is_featured_to_products.py
0003_add_order_notes_column.py
```

### `env.py` must use async engine and import all models

```python
# migrations/env.py
import asyncio
from alembic import context
from sqlalchemy.ext.asyncio import create_async_engine
from app.database import Base
from app.config import settings
import app.models  # triggers __init__.py which imports all models

def run_migrations_online():
    connectable = create_async_engine(settings.DATABASE_URL)

    async def do_run():
        async with connectable.connect() as connection:
            await connection.run_sync(do_migrations)

    asyncio.run(do_run())

def do_migrations(connection):
    context.configure(connection=connection, target_metadata=Base.metadata)
    with context.begin_transaction():
        context.run_migrations()
```

---

## 8. Writing Queries

Always use SQLAlchemy 2 `select()` — never `session.query()` (legacy style).

### Fetch one by primary key

```python
product = await db.get(Product, product_id)
```

### Fetch one by condition

```python
result = await db.execute(
    select(Product).where(Product.slug == slug, Product.is_active == True)
)
product = result.scalar_one_or_none()
```

### Fetch list with filters

```python
query = select(Product).where(Product.is_active == True).order_by(Product.created_at.desc())

if category_slug:
    query = query.join(Category).where(Category.slug == category_slug)

if search:
    query = query.where(Product.name.ilike(f'%{search}%'))

result = await db.execute(query)
products = result.scalars().all()
```

### Insert

```python
product = Product(**data.model_dump(), slug=slug)
db.add(product)
await db.flush()
await db.refresh(product)
```

### Partial update

```python
from sqlalchemy import update

await db.execute(
    update(Product)
    .where(Product.id == product_id)
    .values(**update_data)
)
```

### Lock row before stock decrement

```python
result = await db.execute(
    select(Product).where(Product.id == product_id).with_for_update()
)
product = result.scalar_one()
```

Always use `with_for_update()` before decrementing `stock_quantity` to prevent overselling under concurrent requests.

---

## 9. Transactions

All writes happen inside a transaction managed in the service layer.

```python
async with db.begin():
    # all inserts and updates here
    # auto-commits on clean exit, auto-rolls back on exception
    await db.flush()   # get generated IDs without committing
```

### Rules

* Never call `await db.commit()` in a router — only inside `async with db.begin()` in services.
* Never let a partial write succeed — if any step in a transaction fails, the whole block rolls back.
* Side effects (Redis clear, email) happen after the `async with db.begin()` block closes — never inside it.

---

## 10. Soft Deletes

Products and categories use soft delete — never hard delete rows that may be referenced by orders.

```python
# soft delete
await db.execute(
    update(Product).where(Product.id == product_id).values(is_active=False)
)

# all public queries filter by is_active
select(Product).where(Product.is_active == True)
```

Hard delete is only allowed for `ProductImage` rows (and the file from disk).

---

## 11. Redis (Cart)

Cart data lives in Redis — never in PostgreSQL.

```python
# services/cart.py
import json
import redis.asyncio as aioredis
from app.config import settings

redis_client = aioredis.from_url(settings.REDIS_URL, decode_responses=True)

CART_TTL = 60 * 60 * 24 * 7  # 7 days

async def get_cart(cart_id: str) -> dict:
    data = await redis_client.get(f'cart:{cart_id}')
    if not data:
        return {'items': []}
    return json.loads(data)

async def save_cart(cart_id: str, cart: dict) -> None:
    await redis_client.setex(f'cart:{cart_id}', CART_TTL, json.dumps(cart))

async def clear_cart(cart_id: str) -> None:
    await redis_client.delete(f'cart:{cart_id}')
```

### Redis Rules

* One `redis_client` instance — never create more than one.
* Always use `setex` (set + TTL) — bare `set` with no TTL leaks memory.
* Cart keys always prefixed `cart:` — never use a bare UUID as a key.
* JSON serialization only — no pickle.

---

## 12. Comments & Documentation

### Avoid Inline Comments

Do not add comments that explain obvious code behavior.

Bad:

```python
# Set is_active to false
product.is_active = False
```

Good:

```python
product.is_active = False
```

### Allowed Comments

Comments are allowed only when:

* Explaining a non-obvious constraint or business rule.
* Documenting why a specific query pattern was chosen.
* Adding TODOs with context.

Example:

```python
# with_for_update() prevents overselling when two orders are placed simultaneously.
result = await db.execute(select(Product).where(Product.id == pid).with_for_update())
```

---

## 13. Review Checklist

Before finalizing any database-related code, verify:

* [ ] 4-space indentation
* [ ] All models import `Base` from `app.database` — no second Base
* [ ] All models imported in `models/__init__.py`
* [ ] Money columns use `Numeric(10, 2)` — no `Float`
* [ ] Timestamps use `TIMESTAMPTZ` with `server_default=func.now()`
* [ ] Relationships use `lazy='selectin'` to avoid N+1
* [ ] Child relationships use `cascade='all, delete-orphan'`
* [ ] Indexes added for all columns used in WHERE / ORDER BY
* [ ] All writes inside `async with db.begin()` in services — no `commit()` in routers
* [ ] `with_for_update()` used before any stock decrement
* [ ] `flush()` used to get generated IDs within a transaction
* [ ] Soft delete used for products and categories — never hard delete
* [ ] Hard delete only for `ProductImage` rows
* [ ] Alembic migration autogenerated and reviewed before running
* [ ] Migration description is meaningful and follows naming pattern
* [ ] Side effects (email, Redis clear) after the transaction block — never inside it
* [ ] Redis cart always uses `setex` with `CART_TTL`
* [ ] Redis keys always prefixed with `cart:`
* [ ] No unnecessary comments
