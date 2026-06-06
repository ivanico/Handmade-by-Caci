import asyncio
from datetime import datetime
from math import ceil

import redis.asyncio as aioredis
from sqlalchemy import func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.order import Order, OrderItem
from app.models.product import Product
from app.repositories import cart_repository, order_repository
from app.schemas.common import PaginatedResponse
from app.schemas.order import OrderCreate, OrderOut, OrderStatusUpdate
from app.services import email as email_service


async def create_order(
    db: AsyncSession,
    redis: aioredis.Redis,
    cart_id: str | None,
    data: OrderCreate,
) -> Order:
    cart_data = await cart_repository.get_cart_data(redis, cart_id) if cart_id else {"items": []}

    if not cart_data.get("items"):
        raise ValueError("Cart is empty")

    validated: list[dict] = []
    total_amount = 0.0

    for item in cart_data["items"]:
        result = await db.execute(
            select(Product).where(Product.id == item["product_id"]).with_for_update()
        )
        product = result.scalar_one_or_none()
        if not product or not product.is_active:
            raise ValueError(f"Product {item['product_id']} not found")
        qty = item["quantity"]
        if product.stock_quantity < qty:
            raise ValueError(f"'{product.name}' only has {product.stock_quantity} in stock")
        unit_price = float(product.price)
        subtotal = unit_price * qty
        total_amount += subtotal
        validated.append(
            {
                "product": product,
                "variant_id": item.get("variant_id"),
                "quantity": qty,
                "unit_price": unit_price,
                "subtotal": subtotal,
            }
        )

    year = datetime.now().year
    count = (
        await db.execute(
            select(func.count(Order.id)).where(Order.order_number.like(f"ORD-{year}-%"))
        )
    ).scalar() or 0
    order_number = f"ORD-{year}-{count + 1:04d}"

    order = Order(
        order_number=order_number,
        customer_name=data.customer_name,
        customer_email=str(data.customer_email),
        customer_phone=data.customer_phone,
        shipping_address=data.shipping_address.model_dump(),
        notes=data.notes,
        total_amount=round(total_amount, 2),
    )
    db.add(order)
    await db.flush()

    for v in validated:
        product = v["product"]
        db.add(
            OrderItem(
                order_id=order.id,
                product_id=product.id,
                variant_id=v["variant_id"],
                product_name=product.name,
                product_sku=product.sku,
                unit_price=v["unit_price"],
                quantity=v["quantity"],
                subtotal=v["subtotal"],
            )
        )
        await db.execute(
            update(Product)
            .where(Product.id == product.id)
            .values(stock_quantity=Product.stock_quantity - v["quantity"])
        )

    await db.flush()
    await db.refresh(order)

    if cart_id:
        await cart_repository.delete_cart(redis, cart_id)

    order_snapshot = OrderOut.model_validate(order)
    asyncio.create_task(email_service.send_customer_confirmation(order_snapshot))
    asyncio.create_task(email_service.send_admin_notification(order_snapshot))

    return order


async def get_order(db: AsyncSession, order_number: str, email: str) -> Order:
    order = await order_repository.get_by_order_number(db, order_number)
    if not order:
        raise ValueError("Order not found")
    if order.customer_email.lower() != email.lower():
        raise ValueError("Forbidden")
    return order


async def list_orders(
    db: AsyncSession,
    *,
    status: str | None = None,
    search: str | None = None,
    sort: str = "newest",
    page: int = 1,
    limit: int = 20,
) -> PaginatedResponse:
    rows, total = await order_repository.list_orders(
        db, status=status, search=search, sort=sort, page=page, limit=limit
    )
    return PaginatedResponse(
        items=[OrderOut.model_validate(o) for o in rows],
        total=total,
        page=page,
        pages=ceil(total / limit) if total else 1,
    )


async def get_order_by_id(db: AsyncSession, order_id: int) -> Order:
    order = await order_repository.get_by_id(db, order_id)
    if not order:
        raise ValueError("Order not found")
    return order


async def update_order_status(
    db: AsyncSession, order_id: int, data: OrderStatusUpdate
) -> Order:
    result = await db.execute(
        select(Order).where(Order.id == order_id).with_for_update()
    )
    order = result.scalar_one_or_none()
    if not order:
        raise ValueError("Order not found")
    if data.status is not None:
        order.status = data.status
    if data.payment_status is not None:
        order.payment_status = data.payment_status
    if data.notes is not None:
        order.notes = data.notes
    await db.flush()
    await db.refresh(order)
    return order
