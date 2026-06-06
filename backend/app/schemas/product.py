from decimal import Decimal

from pydantic import BaseModel


class CategoryRef(BaseModel):
    id: int
    name: str
    slug: str

    model_config = {"from_attributes": True}


class ImageRef(BaseModel):
    id: int
    url: str
    alt_text: str | None = None
    sort_order: int
    is_primary: bool

    model_config = {"from_attributes": True}


class VariantOut(BaseModel):
    id: int
    name: str | None = None
    value: str | None = None
    price_modifier: Decimal
    stock_quantity: int

    model_config = {"from_attributes": True}


class ProductListItem(BaseModel):
    id: int
    name: str
    slug: str
    price: Decimal
    compare_at_price: Decimal | None = None
    is_featured: bool
    stock_quantity: int
    category: CategoryRef | None = None
    primary_image: ImageRef | None = None


class ProductOut(BaseModel):
    id: int
    name: str
    slug: str
    description: str | None = None
    price: Decimal
    compare_at_price: Decimal | None = None
    sku: str
    stock_quantity: int
    is_active: bool
    is_featured: bool
    category: CategoryRef | None = None
    primary_image: ImageRef | None = None
    images: list[ImageRef] = []
    variants: list[VariantOut] = []


class ProductCreate(BaseModel):
    name: str
    category_id: int | None = None
    description: str | None = None
    price: Decimal
    compare_at_price: Decimal | None = None
    sku: str
    stock_quantity: int = 0
    is_featured: bool = False
    is_active: bool = True


class ProductUpdate(BaseModel):
    name: str | None = None
    category_id: int | None = None
    description: str | None = None
    price: Decimal | None = None
    compare_at_price: Decimal | None = None
    sku: str | None = None
    stock_quantity: int | None = None
    is_featured: bool | None = None
    is_active: bool | None = None


class ImageReorderRequest(BaseModel):
    order: list[int]
