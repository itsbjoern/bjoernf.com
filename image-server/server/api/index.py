import os
from aiohttp import web
from PIL import Image
from aiohttp import web
import pathlib

formats = {
  'png': 'PNG',
  'jpg': 'JPEG'
}


async def handler(request):
  img_path = request.match_info.get('tail', None)
  if not img_path:
    return web.HTTPNotFound()
  ext = request.query.get('ext', 'jpg')
  max_size = int(request.query.get('max_size', 1200))
  quality = int(request.query.get('quality', 95))

  options = dict(
    ext=ext,
    max_size=max_size,
    quality=quality
  )

  root = pathlib.Path(__file__).parent.parent if request.app['dev'] else '/'

  add = '_'.join([f'{k}={v}' for k, v in sorted(options.items())])
  compressed_name = img_path.replace('.'+img_path.split('.')[-1], f'_{add}.'+ext).replace('/', '-')
  compressed_path = os.path.join(root, 'dist', 'cache', compressed_name)
  if os.path.isfile(compressed_path):
    return web.FileResponse(compressed_path)

  img_path = os.path.join(root, 'dist', img_path)
  if not os.path.isfile(img_path):
    return web.HTTPNotFound()
  if not formats.get(ext):
    return web.HTTPNotFound()

  compress_image(img_path, compressed_path, **options)
  return web.FileResponse(compressed_path)


def compress_image(path, compress_path, **kwargs):
  img = Image.open(path)
  ar = kwargs.get('max_size') / max(*img.size, kwargs.get('max_size'))
  new_size = [int(le * ar) for le in img.size]

  if kwargs.get('ext') == 'jpg':
    img = img.convert('RGB')

  img = img.resize(new_size, Image.ANTIALIAS)
  img.save(compress_path, quality=kwargs.get('quality'), format=formats[kwargs.get('ext')], optimize=True)
