"""
Utilities to support image related modification tasks
"""
import io
from typing import Optional, Tuple
from aiohttp import web
from PIL import Image
from blogapi.models import Options

formats = {
    'png': 'PNG',
    'jpg': 'JPEG'
}


def compress_image(image_bytes: bytearray, options: Optional[Options]=None) -> bytes:
    if not options:
        options = Options()
    pil_image = Image.open(io.BytesIO(image_bytes))
    ext = options.get('ext', 'jpg')
    max_size = options.get('max_size', 1200)
    quality = options.get('quality', 80)

    aspect_ratio = max_size / max(*pil_image.size, max_size)
    new_size: Tuple[int, int] = (
        int(pil_image.size[0] * aspect_ratio),
        int(pil_image.size[1] * aspect_ratio))

    if ext == 'jpg':
        pil_image = pil_image.convert('RGB')

    if ext not in formats:
        raise web.HTTPBadRequest(reason='Extension not allowed')

    resized_image = pil_image.resize(new_size, Image.ANTIALIAS)
    new_img = io.BytesIO()
    resized_image.save(new_img, quality=quality,
                       format=formats[ext], optimize=True)
    return new_img.getvalue()
