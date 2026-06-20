from sqlalchemy import func
from sqlalchemy import or_
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.product import Product
from app.models.product import ProductImage


async def list_products(
    db: AsyncSession,
    *,
    category_id: int | None = None,
    search: str | None = None,
    sort: str = "newest",
    page: int = 1,
    limit: int = 24,
    active_only: bool = True,
    featured: bool | None = None,
    min_price: float | None = None,
    max_price: float | None = None,
) -> tuple[list[Product], int]:
    q = select(Product)
    if active_only:
        q = q.where(Product.is_active == True)
    if category_id is not None:
        q = q.where(Product.category_id == category_id)
    if search:
        q = q.where(
            or_(
                Product.name.ilike(f"%{search}%"),
                Product.name_mk.ilike(f"%{search}%"),
                Product.description.ilike(f"%{search}%"),
                Product.description_mk.ilike(f"%{search}%"),
            )
        )
    if featured:
        q = q.where(Product.is_featured == True)
    if min_price is not None:
        q = q.where(Product.price >= min_price)
    if max_price is not None:
        q = q.where(Product.price <= max_price)

    count_result = await db.execute(select(func.count()).select_from(q.subquery()))
    total = count_result.scalar_one()

    if sort == "price_asc":
        q = q.order_by(Product.price.asc())
    elif sort == "price_desc":
        q = q.order_by(Product.price.desc())
    elif sort == "featured":
        q = q.order_by(Product.is_featured.desc(), Product.created_at.desc())
    else:
        q = q.order_by(Product.created_at.desc())

    q = q.offset((page - 1) * limit).limit(limit)
    result = await db.execute(q)
    return list(result.scalars().all()), total


async def get_by_slug(db: AsyncSession, slug: str) -> Product | None:
    result = await db.execute(
        select(Product).where(Product.slug == slug, Product.is_active == True)
    )
    return result.scalar_one_or_none()


async def get_by_id(db: AsyncSession, product_id: int) -> Product | None:
    return await db.get(Product, product_id)


async def create(db: AsyncSession, **fields) -> Product:
    product = Product(**fields)
    db.add(product)
    await db.flush()
    await db.refresh(product)
    return product


async def update(db: AsyncSession, product: Product, data: dict) -> Product:
    for key, value in data.items():
        setattr(product, key, value)
    await db.flush()
    await db.refresh(product)
    return product


async def soft_delete(db: AsyncSession, product: Product) -> None:
    product.is_active = False
    await db.flush()


async def get_image(db: AsyncSession, image_id: int) -> ProductImage | None:
    return await db.get(ProductImage, image_id)


async def add_image(
    db: AsyncSession,
    product_id: int,
    url: str,
    alt_text: str | None,
    sort_order: int,
    is_primary: bool,
    thumbnail_url: str | None = None,
) -> ProductImage:
    image = ProductImage(
        product_id=product_id,
        url=url,
        thumbnail_url=thumbnail_url,
        alt_text=alt_text,
        sort_order=sort_order,
        is_primary=is_primary,
    )
    db.add(image)
    await db.flush()
    await db.refresh(image)
    return image


async def delete_image(db: AsyncSession, image: ProductImage) -> None:
    await db.delete(image)
    await db.flush()


async def set_image_orders(db: AsyncSession, product_id: int, order: list[int]) -> None:
    for idx, image_id in enumerate(order):
        image = await db.get(ProductImage, image_id)
        if image and image.product_id == product_id:
            image.sort_order = idx
            image.is_primary = idx == 0
    await db.flush()
