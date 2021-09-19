from aiohttp import web
from aiohttp_middlewares import cors_middleware


async def error_middleware(app, handler):
  async def mid(request):
    response = await handler(request)
    if response.status == 500:
      return response
      # return web.json_response({'ok': False}, status=500)
    return response
  return mid


async def easy_access_middleware(app, handler):
  async def mid(request):
    setattr(request, 'use', lambda x: request.app[x])
    return await handler(request)
  return mid


def setup_middlewares(app):
  app.middlewares.extend([
    cors_middleware(allow_all=True),
    error_middleware,
    easy_access_middleware
  ])
