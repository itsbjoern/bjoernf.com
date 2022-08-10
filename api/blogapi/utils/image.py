"""
Utilities to support image related modification tasks
"""
import io
from aiohttp import web
from PIL import Image


formats = {
    'png': 'PNG',
    'jpg': 'JPEG'
}


def compress_image(image_bytes, options=None):
    if not options:
        options = {}
    pil_image = Image.open(io.BytesIO(image_bytes))
    ext = options.get('ext', 'jpg')
    max_size = options.get('max_size', 1200)
    quality = options.get('quality', 95)
    ext = options.get('ext', 'jpg')

    ar = max_size / max(*pil_image.size, max_size)
    new_size = [int(le * ar) for le in pil_image.size]

    if ext == 'jpg':
        pil_image = pil_image.convert('RGB')

    if ext not in formats:
        raise web.HTTPBadRequest(reason='Extension not allowed')

    resized_image = pil_image.resize(new_size, Image.ANTIALIAS)
    new_img = io.BytesIO()
    resized_image.save(new_img, quality=quality,
                       format=formats[ext], optimize=True)
    return new_img.getvalue()
