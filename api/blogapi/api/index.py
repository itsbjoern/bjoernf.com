import pathlib
import json
import os
from aiohttp import web, ClientSession

from blogapi.api import hydrations

PROJECT_ROOT = pathlib.Path(__file__).parent.parent
BUILD_ROOT = PROJECT_ROOT / 'public'


async def handler(request):
  url = str(request.rel_url)
  user_agent = request.headers['User-Agent']
  req_data = json.dumps({'url': url, 'absUrl': str(request.url), 'userAgent': user_agent})

  node_addr = request.app['config']['node.address']
  node_port = request.app['config']['node.port']

  session = ClientSession()
  data = None
  async with session.post(f'http://{node_addr}:{node_port}/render',
                          data=req_data,
                          headers={'Content-Type': 'application/json'}) as resp:
    data = await resp.json()
  await session.close()

  if 'markup' not in data:
    return await not_found_html(request)

  index = hydrations.IndexHydrate(request)
  index.hydrate('script', data.get('extraScript', ''))
  index.hydrate('html', data['markup'])
  index.hydrate('title')

  return web.Response(
    text=index.page,
    content_type='text/html')


async def not_found(request):
    raise web.HTTPNotFound()


async def not_found_html(request):
  index = hydrations.IndexHydrate(request)
  index.hydrate('html', '404 Page not found')
  index.hydrate('title', 'Not found')
  index.hydrate('script', '')

  return web.Response(
    text=index.page,
    content_type='text/html')
