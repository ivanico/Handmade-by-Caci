from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, EmailStr


class ShippingAddressIn(BaseModel):
    line1: str
    line2: str | None = None
    city: str
    postal_code: str
    country: str


class OrderCreate(BaseModel):
    customer_name: str
    customer_email: EmailStr
    customer_phone: str | None = None
    shipping_address: ShippingAddressIn
    notes: str | None = None


class OrderItemOut(BaseModel):
    id: int
    product_id: int
    variant_id: int | None
    product_name: str
    product_sku: str
    unit_price: Decimal
    quantity: int
    subtotal: Decimal

    model_config = ConfigDict(from_attributes=True)


class OrderOut(BaseModel):
    id: int
    order_number: str
    customer_name: str
    customer_email: str
    customer_phone: str | None
    shipping_address: dict
    status: str
    payment_status: str
    notes: str | None
    total_amount: Decimal
    created_at: datetime
    updated_at: datetime
    items: list[OrderItemOut]

    model_config = ConfigDict(from_attributes=True)


class OrderStatusUpdate(BaseModel):
    status: str | None = None
    payment_status: str | None = None
    notes: str | None = None
