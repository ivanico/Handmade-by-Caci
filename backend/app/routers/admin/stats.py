from decimal import Decimal

from fastapi import APIRouter
from fastapi import Depends
from pydantic import BaseModel
from sqlalchemy import and_
from sqlalchemy import func
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db
from app.dependencies import require_admin
from app.models.order import Order
from app.models.product import Product


class StatsOut(BaseModel):
    total_products: int
    active_orders: int
    low_stock_count: int
    total_revenue: Decimal


router = APIRouter(
    prefix="/api/admin/stats",
    tags=["admin-stats"],
    dependencies=[Depends(require_admin)],
)


@router.get("", response_model=StatsOut)
async def get_stats(db: AsyncSession = Depends(get_db)):
    stmt = select(
        select(func.count())
        .where(Product.is_active == True)
        .scalar_subquery()
        .label("total_products"),
        select(func.count())
        .where(Order.status.not_in(["delivered", "cancelled"]))
        .scalar_subquery()
        .label("active_orders"),
        select(func.count())
        .where(and_(Product.stock_quantity < 5, Product.is_active == True))
        .scalar_subquery()
        .label("low_stock_count"),
        func.coalesce(
            select(func.sum(Order.total_amount))
            .where(Order.payment_status == "paid")
            .scalar_subquery(),
            0,
        ).label("total_revenue"),
    )
    row = (await db.execute(stmt)).one()
    return StatsOut(
        total_products=row.total_products,
        active_orders=row.active_orders,
        low_stock_count=row.low_stock_count,
        total_revenue=row.total_revenue,
    )
