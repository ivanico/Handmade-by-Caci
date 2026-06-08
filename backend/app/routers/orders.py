import redis.asyncio as aioredis
from fastapi import APIRouter, Cookie, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db
from app.dependencies.common import get_redis
from app.schemas.order import OrderCreate, OrderOut
from app.services import order as order_service

router = APIRouter(prefix="/api/orders", tags=["orders"])


@router.post("", response_model=OrderOut, status_code=201)
async def create_order(
    body: OrderCreate,
    cart_id: str | None = Cookie(None, alias="cart_id"),
    db: AsyncSession = Depends(get_db),
    redis: aioredis.Redis = Depends(get_redis),
):
    try:
        return await order_service.create_order(db, redis, cart_id, body)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{order_number}", response_model=OrderOut)
async def get_order(
    order_number: str,
    email: str = Query(...),
    db: AsyncSession = Depends(get_db),
):
    try:
        return await order_service.get_order(db, order_number, email)
    except ValueError as e:
        status_code = 403 if "Forbidden" in str(e) else 404
        raise HTTPException(status_code=status_code, detail=str(e))


@router.post("/{order_id}/pay", status_code=501)
async def pay_order(order_id: int):
    # TODO wire Stripe or PayPal here
    raise HTTPException(status_code=501, detail="Payment not implemented")
