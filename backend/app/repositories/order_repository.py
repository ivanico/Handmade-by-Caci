from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.order import Order


async def get_by_order_number(db: AsyncSession, order_number: str) -> Order | None:
    result = await db.execute(select(Order).where(Order.order_number == order_number))
    return result.scalar_one_or_none()


async def get_by_id(db: AsyncSession, order_id: int) -> Order | None:
    result = await db.execute(select(Order).where(Order.id == order_id))
    return result.scalar_one_or_none()


async def list_orders(
    db: AsyncSession,
    *,
    status: str | None = None,
    search: str | None = None,
    sort: str = "newest",
    page: int = 1,
    limit: int = 20,
) -> tuple[list[Order], int]:
    query = select(Order)

    if status:
        query = query.where(Order.status == status)

    if search:
        term = f"%{search}%"
        query = query.where(
            or_(
                Order.order_number.ilike(term),
                Order.customer_email.ilike(term),
                Order.customer_name.ilike(term),
            )
        )

    if sort == "oldest":
        query = query.order_by(Order.created_at.asc())
    else:
        query = query.order_by(Order.created_at.desc())

    count_q = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_q)).scalar() or 0

    rows = (await db.execute(query.offset((page - 1) * limit).limit(limit))).scalars().all()
    return list(rows), total
