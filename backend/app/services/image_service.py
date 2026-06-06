import io
import os
import uuid

from PIL import Image

from app.core.config import settings

MAX_WIDTH = 1200


def _resize(data: bytes, ext: str) -> bytes:
    img = Image.open(io.BytesIO(data))
    if img.width > MAX_WIDTH:
        ratio = MAX_WIDTH / img.width
        img = img.resize((MAX_WIDTH, int(img.height * ratio)), Image.LANCZOS)
    buf = io.BytesIO()
    fmt = "JPEG" if ext.lower() in ("jpg", "jpeg") else ext.upper()
    img.save(buf, format=fmt)
    return buf.getvalue()


def save_product_image(product_id: int, data: bytes, ext: str) -> str:
    resized = _resize(data, ext)
    dir_path = os.path.join(settings.MEDIA_DIR, "products", str(product_id))
    os.makedirs(dir_path, exist_ok=True)
    filename = f"{uuid.uuid4().hex}.{ext.lower()}"
    with open(os.path.join(dir_path, filename), "wb") as f:
        f.write(resized)
    return f"/media/products/{product_id}/{filename}"


def delete_product_image_file(url: str) -> None:
    rel = url.removeprefix("/media/")
    path = os.path.join(settings.MEDIA_DIR, rel)
    if os.path.exists(path):
        os.remove(path)
