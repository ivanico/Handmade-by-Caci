from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException
from fastapi import Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db
from app.schemas.common import PaginatedResponse
from app.schemas.product import ProductListItem
from app.schemas.product import ProductOut
from app.services import product_service

router = APIRouter(prefix="/api/products", tags=["products"])


@router.get("", response_model=PaginatedResponse[ProductListItem])
async def list_products(
    category: str | None = Query(None),
    search: str | None = Query(None),
    sort: str = Query("newest"),
    page: int = Query(1, ge=1),
    limit: int = Query(24, le=48),
    featured: bool | None = Query(None),
    db: AsyncSession = Depends(get_db),
):
    try:
        return await product_service.list_products(
            db,
            category_slug=category,
            search=search,
            sort=sort,
            page=page,
            limit=limit,
            featured=featured,
        )
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))


@router.get("/{slug}", response_model=ProductOut)
async def get_product(slug: str, db: AsyncSession = Depends(get_db)):
    try:
        return await product_service.get_product(db, slug)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))
