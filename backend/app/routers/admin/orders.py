from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db, require_admin
from app.schemas.common import PaginatedResponse
from app.schemas.order import OrderOut, OrderStatusUpdate
from app.services import order as order_service

router = APIRouter(
    prefix="/api/admin/orders",
    tags=["admin-orders"],
    dependencies=[Depends(require_admin)],
)


@router.get("", response_model=PaginatedResponse[OrderOut])
async def list_orders(
    status: str | None = Query(None),
    search: str | None = Query(None),
    sort: str = Query("newest"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, le=100),
    db: AsyncSession = Depends(get_db),
):
    return await order_service.list_orders(
        db, status=status, search=search, sort=sort, page=page, limit=limit
    )


@router.get("/{id}", response_model=OrderOut)
async def get_order(id: int, db: AsyncSession = Depends(get_db)):
    try:
        return await order_service.get_order_by_id(db, id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.put("/{id}/status", response_model=OrderOut)
async def update_order_status(
    id: int,
    body: OrderStatusUpdate,
    db: AsyncSession = Depends(get_db),
):
    try:
        return await order_service.update_order_status(db, id, body)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
