from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.routers.auth import router as auth_router
from app.routers.categories import router as categories_router
from app.routers.admin.categories import router as admin_categories_router
from app.routers.products import router as products_router
from app.routers.admin.products import router as admin_products_router
from app.routers.admin.stats import router as admin_stats_router
from app.routers.cart import router as cart_router
from app.routers.orders import router as orders_router
from app.routers.admin.orders import router as admin_orders_router

app = FastAPI(title="Shop CMS")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/media", StaticFiles(directory=settings.MEDIA_DIR), name="media")

app.include_router(auth_router)
app.include_router(categories_router)
app.include_router(admin_categories_router)
app.include_router(products_router)
app.include_router(admin_products_router)
app.include_router(admin_stats_router)
app.include_router(cart_router)
app.include_router(orders_router)
app.include_router(admin_orders_router)


@app.exception_handler(ValueError)
async def value_error_handler(request: Request, exc: ValueError) -> JSONResponse:
    return JSONResponse(status_code=400, content={"detail": str(exc)})