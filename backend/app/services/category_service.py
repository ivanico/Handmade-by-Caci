import os

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models.product import Category
from app.repositories import category_repository
from app.schemas.category import CategoryCreate
from app.schemas.category import CategoryUpdate
from app.utils.slug import generate_slug


async def list_categories(db: AsyncSession) -> list[dict]:
    categories = await category_repository.get_all_active(db)
    result = []
    for cat in categories:
        count = await category_repository.count_active_products(db, cat.id)
        d = {c.key: getattr(cat, c.key) for c in cat.__table__.columns}
        d["product_count"] = count
        result.append(d)
    return result


async def get_category(db: AsyncSession, slug: str) -> Category:
    category = await category_repository.get_by_slug(db, slug)
    if not category:
        raise ValueError("Category not found")
    return category


async def create_category(db: AsyncSession, data: CategoryCreate) -> Category:
    slug = generate_slug(data.name)
    return await category_repository.create(
        db,
        name=data.name,
        slug=slug,
        description=data.description,
        parent_id=data.parent_id,
    )


async def update_category(db: AsyncSession, category_id: int, data: CategoryUpdate) -> Category | None:
    category = await category_repository.get_by_id(db, category_id)
    if not category:
        return None
    updates = {k: v for k, v in data.model_dump().items() if v is not None}
    if "name" in updates and "slug" not in updates:
        updates["slug"] = generate_slug(updates["name"])
    return await category_repository.update(db, category, updates)


async def delete_category(db: AsyncSession, category_id: int) -> None:
    category = await category_repository.get_by_id(db, category_id)
    if not category:
        raise ValueError("Category not found")
    count = await category_repository.count_active_products(db, category_id)
    if count > 0:
        raise ValueError(f"Category has {count} active products")
    await category_repository.soft_delete(db, category)


async def upload_image(db: AsyncSession, category_id: int, file_bytes: bytes, ext: str) -> str:
    category = await category_repository.get_by_id(db, category_id)
    if not category:
        raise ValueError("Category not found")
    dir_path = os.path.join(settings.MEDIA_DIR, "categories")
    os.makedirs(dir_path, exist_ok=True)
    filename = f"{category_id}.{ext}"
    file_path = os.path.join(dir_path, filename)
    with open(file_path, "wb") as f:
        f.write(file_bytes)
    image_url = f"/media/categories/{filename}"
    await category_repository.update(db, category, {"image_url": image_url})
    return image_url
