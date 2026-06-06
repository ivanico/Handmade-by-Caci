from fastapi import APIRouter
from fastapi import Depends
from fastapi import File
from fastapi import HTTPException
from fastapi import Query
from fastapi import UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db
from app.dependencies import require_admin
from app.schemas.common import PaginatedResponse
from app.schemas.product import ImageRef
from app.schemas.product import ImageReorderRequest
from app.schemas.product import ProductCreate
from app.schemas.product import ProductOut
from app.schemas.product import ProductUpdate
from app.services import product_service

router = APIRouter(
    prefix="/api/admin/products",
    tags=["admin-products"],
    dependencies=[Depends(require_admin)],
)


@router.get("", response_model=PaginatedResponse[ProductOut])
async def list_products_admin(
    search: str | None = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(24, le=48),
    db: AsyncSession = Depends(get_db),
):
    return await product_service.list_products_admin(db, search=search, page=page, limit=limit)


@router.get("/{product_id}", response_model=ProductOut)
async def get_product_admin(product_id: int, db: AsyncSession = Depends(get_db)):
    result = await product_service.get_product_by_id(db, product_id)
    if not result:
        raise HTTPException(status_code=404, detail="Product not found")
    return result


@router.post("", response_model=ProductOut, status_code=201)
async def create_product(data: ProductCreate, db: AsyncSession = Depends(get_db)):
    try:
        return await product_service.create_product(db, data)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@router.put("/{product_id}", response_model=ProductOut)
async def update_product(
    product_id: int, data: ProductUpdate, db: AsyncSession = Depends(get_db)
):
    try:
        result = await product_service.update_product(db, product_id, data)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    if result is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return result


@router.delete("/{product_id}")
async def delete_product(product_id: int, db: AsyncSession = Depends(get_db)):
    try:
        await product_service.delete_product(db, product_id)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))
    return {"ok": True}


@router.post("/{product_id}/images", response_model=list[ImageRef])
async def add_images(
    product_id: int,
    files: list[UploadFile] = File(...),
    db: AsyncSession = Depends(get_db),
):
    file_data = []
    for f in files:
        ext = (f.filename or "jpg").rsplit(".", 1)[-1].lower()
        data = await f.read()
        file_data.append((data, ext))
    try:
        return await product_service.add_images(db, product_id, file_data)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@router.delete("/{product_id}/images/{image_id}")
async def delete_image(
    product_id: int, image_id: int, db: AsyncSession = Depends(get_db)
):
    try:
        await product_service.delete_image(db, product_id, image_id)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))
    return {"ok": True}


@router.put("/{product_id}/images/reorder")
async def reorder_images(
    product_id: int,
    body: ImageReorderRequest,
    db: AsyncSession = Depends(get_db),
):
    try:
        await product_service.reorder_images(db, product_id, body.order)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))
    return {"ok": True}
