from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException
from fastapi import UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db
from app.dependencies import require_admin
from app.schemas.category import CategoryCreate
from app.schemas.category import CategoryOut
from app.schemas.category import CategoryUpdate
from app.services import category_service

router = APIRouter(
    prefix="/api/admin/categories",
    tags=["admin-categories"],
    dependencies=[Depends(require_admin)],
)


@router.post("", response_model=CategoryOut, status_code=201)
async def create_category(data: CategoryCreate, db: AsyncSession = Depends(get_db)):
    try:
        return await category_service.create_category(db, data)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@router.put("/{category_id}", response_model=CategoryOut)
async def update_category(
    category_id: int, data: CategoryUpdate, db: AsyncSession = Depends(get_db)
):
    try:
        result = await category_service.update_category(db, category_id, data)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    if result is None:
        raise HTTPException(status_code=404, detail="Category not found")
    return result


@router.delete("/{category_id}")
async def delete_category(category_id: int, db: AsyncSession = Depends(get_db)):
    try:
        await category_service.delete_category(db, category_id)
    except ValueError as exc:
        detail = str(exc)
        status = 400 if "active products" in detail else 404
        raise HTTPException(status_code=status, detail=detail)
    return {"ok": True}


@router.post("/{category_id}/image")
async def upload_image(
    category_id: int, file: UploadFile, db: AsyncSession = Depends(get_db)
):
    ext = (file.filename or "jpg").rsplit(".", 1)[-1].lower()
    contents = await file.read()
    try:
        url = await category_service.upload_image(db, category_id, contents, ext)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))
    return {"image_url": url}
