from pydantic import BaseModel


class CartItemIn(BaseModel):
    product_id: int
    variant_id: int | None = None
    quantity: int


class CartItemUpdate(BaseModel):
    quantity: int


class CartItemOut(BaseModel):
    product_id: int
    variant_id: int | None
    quantity: int
    name: str
    price: float
    available_quantity: int
    image_url: str | None


class CartOut(BaseModel):
    items: list[CartItemOut]
    item_count: int
    subtotal: float
