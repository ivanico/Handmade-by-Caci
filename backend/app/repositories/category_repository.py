from sqlalchemy import func
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.product import Category
from app.models.product import Product


async def get_all_active(db: AsyncSession) -> list[Category]:
    result = await db.execute(select(Category).where(Category.is_active == True))
    return list(result.scalars().all())


async def get_by_slug(db: AsyncSession, slug: str) -> Category | None:
    result = await db.execute(
        select(Category).where(Category.slug == slug, Category.is_active == True)
    )
    return result.scalar_one_or_none()


async def get_by_id(db: AsyncSession, category_id: int) -> Category | None:
    return await db.get(Category, category_id)


async def count_active_products(db: AsyncSession, category_id: int) -> int:
    result = await db.execute(
        select(func.count()).where(
            Product.category_id == category_id,
            Product.is_active == True,
        )
    )
    return result.scalar_one()


async def create(
    db: AsyncSession,
    name: str,
    slug: str,
    description: str | None,
    parent_id: int | None,
    name_mk: str | None = None,
    description_mk: str | None = None,
) -> Category:
    category = Category(
        name=name,
        slug=slug,
        description=description,
        parent_id=parent_id,
        name_mk=name_mk,
        description_mk=description_mk,
    )
    db.add(category)
    await db.flush()
    await db.refresh(category)
    return category


async def update(db: AsyncSession, category: Category, data: dict) -> Category:
    for key, value in data.items():
        setattr(category, key, value)
    await db.flush()
    await db.refresh(category)
    return category


async def soft_delete(db: AsyncSession, category: Category) -> None:
    category.is_active = False
    await db.flush()