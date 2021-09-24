from aiohttp import web
from aiohttp_middlewares import cors_middleware
import socket


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


async def auth_middleware(app, handler):
  async def mid(request):
    request['user'] = None
    auth_header = request.headers.get('Authorization', None)
    if auth_header:
      db = request.use('db')
      user = db.users.find_one({'token': auth_header[7:]})

      request['user'] = user
    return await handler(request)
  return mid


def setup_middlewares(app):
  local = 'http://' + socket.gethostbyname(socket.gethostname()) + ':3000'
  origins = [local, app['config']['connection.webhost']]
  app.middlewares.extend([
    error_middleware,
    cors_middleware(origins=origins),
    easy_access_middleware,
    auth_middleware,
  ])
