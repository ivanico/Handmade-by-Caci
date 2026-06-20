from pydantic import BaseModel


class CategoryCreate(BaseModel):
    name: str
    name_mk: str | None = None
    description: str | None = None
    description_mk: str | None = None
    parent_id: int | None = None


class CategoryUpdate(BaseModel):
    name: str | None = None
    name_mk: str | None = None
    description: str | None = None
    description_mk: str | None = None
    parent_id: int | None = None
    is_active: bool | None = None


class CategoryOut(BaseModel):
    id: int
    name: str
    name_mk: str | None = None
    slug: str
    description: str | None = None
    description_mk: str | None = None
    image_url: str | None = None
    parent_id: int | None = None
    is_active: bool
    product_count: int = 0

    model_config = {"from_attributes": True}
