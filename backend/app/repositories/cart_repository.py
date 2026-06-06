import json
from datetime import datetime, timezone

import redis.asyncio as aioredis

CART_TTL = 604800  # 7 days


async def get_cart_data(redis: aioredis.Redis, cart_id: str) -> dict:
    raw = await redis.get(f"cart:{cart_id}")
    if raw:
        return json.loads(raw)
    return {"items": []}


async def save_cart_data(redis: aioredis.Redis, cart_id: str, data: dict) -> None:
    data["updated_at"] = datetime.now(timezone.utc).isoformat()
    await redis.set(f"cart:{cart_id}", json.dumps(data), ex=CART_TTL)


async def delete_cart(redis: aioredis.Redis, cart_id: str) -> None:
    await redis.delete(f"cart:{cart_id}")
