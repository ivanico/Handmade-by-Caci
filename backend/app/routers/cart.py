import uuid

import redis.asyncio as aioredis
from fastapi import APIRouter, Cookie, Depends, HTTPException, Response
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db
from app.dependencies.common import get_redis
from app.schemas.cart import CartItemIn, CartItemUpdate, CartOut
from app.services import cart as cart_service

CART_COOKIE = "cart_id"
CART_MAX_AGE = 604800

router = APIRouter(prefix="/api/cart", tags=["cart"])


def _set_cart_cookie(response: Response, cart_id: str) -> None:
    response.set_cookie(
        CART_COOKIE,
        cart_id,
        httponly=True,
        samesite="lax",
        max_age=CART_MAX_AGE,
    )


@router.get("", response_model=CartOut)
async def get_cart(
    response: Response,
    cart_id: str | None = Cookie(None, alias=CART_COOKIE),
    db: AsyncSession = Depends(get_db),
    redis: aioredis.Redis = Depends(get_redis),
):
    if not cart_id:
        cart_id = str(uuid.uuid4())
    _set_cart_cookie(response, cart_id)
    return await cart_service.get_cart(redis, db, cart_id)


@router.post("/items", response_model=CartOut)
async def add_item(
    body: CartItemIn,
    response: Response,
    cart_id: str | None = Cookie(None, alias=CART_COOKIE),
    db: AsyncSession = Depends(get_db),
    redis: aioredis.Redis = Depends(get_redis),
):
    if not cart_id:
        cart_id = str(uuid.uuid4())
    _set_cart_cookie(response, cart_id)
    try:
        await cart_service.add_item(redis, db, cart_id, body.product_id, body.variant_id, body.quantity)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return await cart_service.get_cart(redis, db, cart_id)


@router.put("/items/{product_id}", response_model=CartOut)
async def update_item(
    product_id: int,
    body: CartItemUpdate,
    response: Response,
    cart_id: str | None = Cookie(None, alias=CART_COOKIE),
    db: AsyncSession = Depends(get_db),
    redis: aioredis.Redis = Depends(get_redis),
):
    if not cart_id:
        cart_id = str(uuid.uuid4())
    _set_cart_cookie(response, cart_id)
    await cart_service.update_item(redis, cart_id, product_id, body.quantity)
    return await cart_service.get_cart(redis, db, cart_id)


@router.delete("/items/{product_id}", response_model=CartOut)
async def remove_item(
    product_id: int,
    response: Response,
    cart_id: str | None = Cookie(None, alias=CART_COOKIE),
    db: AsyncSession = Depends(get_db),
    redis: aioredis.Redis = Depends(get_redis),
):
    if not cart_id:
        cart_id = str(uuid.uuid4())
    _set_cart_cookie(response, cart_id)
    await cart_service.remove_item(redis, cart_id, product_id)
    return await cart_service.get_cart(redis, db, cart_id)


@router.delete("", response_model=CartOut)
async def clear_cart(
    response: Response,
    cart_id: str | None = Cookie(None, alias=CART_COOKIE),
    db: AsyncSession = Depends(get_db),
    redis: aioredis.Redis = Depends(get_redis),
):
    if not cart_id:
        cart_id = str(uuid.uuid4())
    _set_cart_cookie(response, cart_id)
    await cart_service.clear_cart(redis, cart_id)
    return await cart_service.get_cart(redis, db, cart_id)
