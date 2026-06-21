from math import ceil

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.product import Product
from app.models.product import ProductImage
from app.repositories import category_repository
from app.repositories import product_repository
from app.schemas.product import ProductCreate
from app.schemas.product import ProductUpdate
from app.services import image_service
from app.utils.slug import generate_slug


def _primary_image(product: Product) -> ProductImage | None:
    for img in product.images:
        if img.is_primary:
            return img
    return product.images[0] if product.images else None


def _list_dict(product: Product) -> dict:
    primary = _primary_image(product)
    return {
        "id": product.id,
        "name": product.name,
        "slug": product.slug,
        "price": product.price,
        "compare_at_price": product.compare_at_price,
        "is_featured": product.is_featured,
        "stock_quantity": product.stock_quantity,
        "category": product.category,
        "primary_image": primary,
    }


def _full_dict(product: Product) -> dict:
    d = _list_dict(product)
    d.update(
        {
            "name_mk": product.name_mk,
            "description": product.description,
            "description_mk": product.description_mk,
            "sku": product.sku,
            "is_active": product.is_active,
            "images": list(product.images),
            "variants": list(product.variants),
        }
    )
    return d


async def list_products(
    db: AsyncSession,
    *,
    category_slug: str | None = None,
    search: str | None = None,
    sort: str = "newest",
    page: int = 1,
    limit: int = 24,
    featured: bool | None = None,
    min_price: float | None = None,
    max_price: float | None = None,
) -> dict:
    category_id = None
    if category_slug:
        cat = await category_repository.get_by_slug(db, category_slug)
        if not cat:
            raise ValueError(f"Category '{category_slug}' not found")
        category_id = cat.id

    products, total = await product_repository.list_products(
        db,
        category_id=category_id,
        search=search,
        sort=sort,
        page=page,
        limit=limit,
        active_only=True,
        featured=featured,
        min_price=min_price,
        max_price=max_price,
    )
    return {
        "items": [_list_dict(p) for p in products],
        "total": total,
        "page": page,
        "pages": ceil(total / limit) if total else 1,
    }


async def list_products_admin(
    db: AsyncSession,
    *,
    search: str | None = None,
    page: int = 1,
    limit: int = 24,
) -> dict:
    products, total = await product_repository.list_products(
        db,
        search=search,
        page=page,
        limit=limit,
        active_only=False,
    )
    return {
        "items": [_full_dict(p) for p in products],
        "total": total,
        "page": page,
        "pages": ceil(total / limit) if total else 1,
    }


async def get_product_by_id(db: AsyncSession, product_id: int) -> dict | None:
    product = await product_repository.get_by_id(db, product_id)
    return _full_dict(product) if product else None


async def get_product(db: AsyncSession, slug: str) -> dict:
    product = await product_repository.get_by_slug(db, slug)
    if not product:
        raise ValueError("Product not found")
    return _full_dict(product)


async def create_product(db: AsyncSession, data: ProductCreate) -> dict:
    slug = generate_slug(data.name)
    fields = data.model_dump()
    fields["slug"] = slug
    product = await product_repository.create(db, **fields)
    return _full_dict(product)


async def update_product(db: AsyncSession, product_id: int, data: ProductUpdate) -> dict | None:
    product = await product_repository.get_by_id(db, product_id)
    if not product:
        return None
    updates = data.model_dump(exclude_unset=True)
    if "name" in updates:
        updates["slug"] = generate_slug(updates["name"])
    product = await product_repository.update(db, product, updates)
    return _full_dict(product)


async def delete_product(db: AsyncSession, product_id: int) -> None:
    product = await product_repository.get_by_id(db, product_id)
    if not product:
        raise ValueError("Product not found")
    await product_repository.soft_delete(db, product)


async def add_images(
    db: AsyncSession,
    product_id: int,
    file_data: list[tuple[bytes, str]],
) -> list[ProductImage]:
    product = await product_repository.get_by_id(db, product_id)
    if not product:
        raise ValueError("Product not found")
    existing_count = len(product.images)
    if existing_count + len(file_data) > 8:
        raise ValueError(f"Product can have at most 8 images (currently has {existing_count})")
    saved = []
    for i, (data, ext) in enumerate(file_data):
        url, thumbnail_url = image_service.save_product_image(product_id, data, ext)
        is_primary = existing_count == 0 and i == 0
        img = await product_repository.add_image(
            db,
            product_id=product_id,
            url=url,
            thumbnail_url=thumbnail_url,
            alt_text=None,
            sort_order=existing_count + i,
            is_primary=is_primary,
        )
        saved.append(img)
    return saved


async def delete_image(db: AsyncSession, product_id: int, image_id: int) -> None:
    image = await product_repository.get_image(db, image_id)
    if not image or image.product_id != product_id:
        raise ValueError("Image not found")
    image_service.delete_product_image_file(image.url, image.thumbnail_url)
    await product_repository.delete_image(db, image)


async def reorder_images(db: AsyncSession, product_id: int, order: list[int]) -> None:
    product = await product_repository.get_by_id(db, product_id)
    if not product:
        raise ValueError("Product not found")
    await product_repository.set_image_orders(db, product_id, order)
