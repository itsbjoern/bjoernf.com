import pathlib
from aiohttp import web

PROJECT_ROOT = pathlib.Path(__file__).parent.parent
BUILD_ROOT = PROJECT_ROOT / 'public'


async def handler(request):
  with open(BUILD_ROOT / 'index.html', 'r') as fh:
    return web.Response(
      text=fh.read(),
      content_type='text/html')


async def not_found(request):
  raise web.HTTPNotFound()
