import io
import os
import uuid

from PIL import Image

from app.core.config import settings

MAX_WIDTH = 2400
THUMB_WIDTH = 400


def _resize(data: bytes, ext: str, max_width: int) -> bytes:
    img = Image.open(io.BytesIO(data))
    if img.width > max_width:
        ratio = max_width / img.width
        img = img.resize((max_width, int(img.height * ratio)), Image.LANCZOS)
    fmt = "JPEG" if ext.lower() in ("jpg", "jpeg") else ext.upper()
    if fmt == "JPEG" and img.mode not in ("RGB", "L"):
        img = img.convert("RGB")
    buf = io.BytesIO()
    img.save(buf, format=fmt)
    return buf.getvalue()


def save_product_image(product_id: int, data: bytes, ext: str) -> tuple[str, str]:
    dir_path = os.path.join(settings.MEDIA_DIR, "products", str(product_id))
    os.makedirs(dir_path, exist_ok=True)

    name = uuid.uuid4().hex
    ext_lower = ext.lower()

    full_data = _resize(data, ext, MAX_WIDTH)
    filename = f"{name}.{ext_lower}"
    with open(os.path.join(dir_path, filename), "wb") as f:
        f.write(full_data)

    thumb_data = _resize(data, ext, THUMB_WIDTH)
    thumb_filename = f"{name}_thumb.{ext_lower}"
    with open(os.path.join(dir_path, thumb_filename), "wb") as f:
        f.write(thumb_data)

    base = f"/media/products/{product_id}"
    return f"{base}/{filename}", f"{base}/{thumb_filename}"


def delete_product_image_file(url: str, thumbnail_url: str | None = None) -> None:
    for target in filter(None, [url, thumbnail_url]):
        rel = target.removeprefix("/media/")
        path = os.path.join(settings.MEDIA_DIR, rel)
        if os.path.exists(path):
            os.remove(path)
