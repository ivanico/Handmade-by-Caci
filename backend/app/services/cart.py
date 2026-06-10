import redis.asyncio as aioredis
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories import cart_repository, product_repository
from app.schemas.cart import CartItemOut, CartOut


async def get_cart(redis: aioredis.Redis, db: AsyncSession, cart_id: str) -> CartOut:
    data = await cart_repository.get_cart_data(redis, cart_id)
    items_out: list[CartItemOut] = []
    subtotal = 0.0
    item_count = 0
    for item in data["items"]:
        product = await product_repository.get_by_id(db, item["product_id"])
        if not product or not product.is_active:
            continue
        image_url = next((img.url for img in product.images if img.is_primary), None)
        price = float(product.price)
        items_out.append(
            CartItemOut(
                product_id=product.id,
                variant_id=item.get("variant_id"),
                quantity=item["quantity"],
                name=product.name,
                price=price,
                available_quantity=product.stock_quantity,
                image_url=image_url,  
            )
        )
        subtotal += price * item["quantity"]
        item_count += item["quantity"]
    return CartOut(items=items_out, item_count=item_count, subtotal=round(subtotal, 2))


async def add_item(
    redis: aioredis.Redis,
    db: AsyncSession,
    cart_id: str,
    product_id: int,
    variant_id: int | None,
    quantity: int,
) -> None:
    product = await product_repository.get_by_id(db, product_id)
    if not product or not product.is_active:
        raise ValueError("Product not found")
    data = await cart_repository.get_cart_data(redis, cart_id)
    for item in data["items"]:
        if item["product_id"] == product_id and item.get("variant_id") == variant_id:
            new_qty = item["quantity"] + quantity
            if new_qty > product.stock_quantity:
                raise ValueError(f"Only {product.stock_quantity} in stock")
            item["quantity"] = new_qty
            await cart_repository.save_cart_data(redis, cart_id, data)
            return
    if quantity > product.stock_quantity:
        raise ValueError(f"Only {product.stock_quantity} in stock")
    data["items"].append({"product_id": product_id, "variant_id": variant_id, "quantity": quantity})
    await cart_repository.save_cart_data(redis, cart_id, data)


async def update_item(redis: aioredis.Redis, cart_id: str, product_id: int, quantity: int) -> None:
    data = await cart_repository.get_cart_data(redis, cart_id)
    if quantity == 0:
        data["items"] = [i for i in data["items"] if i["product_id"] != product_id]
    else:
        for item in data["items"]:
            if item["product_id"] == product_id:
                item["quantity"] = quantity
                break
    await cart_repository.save_cart_data(redis, cart_id, data)


async def remove_item(redis: aioredis.Redis, cart_id: str, product_id: int) -> None:
    data = await cart_repository.get_cart_data(redis, cart_id)
    data["items"] = [i for i in data["items"] if i["product_id"] != product_id]
    await cart_repository.save_cart_data(redis, cart_id, data)


async def clear_cart(redis: aioredis.Redis, cart_id: str) -> None:
    await cart_repository.delete_cart(redis, cart_id)
