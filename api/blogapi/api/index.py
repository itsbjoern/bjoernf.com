import pathlib
import json
import os
from aiohttp import web, ClientSession
import urllib.parse

from blogapi.api import hydrations


async def handler(request):
  url = str(request.rel_url)

  cache_url = request.app['config']['paths.cache'] / urllib.parse.quote(url, safe='')
  is_dev = request.app['config']['dev']
  if not is_dev and os.path.isfile(cache_url):
    with open(cache_url) as fh:
      return web.Response(
        text=fh.read(),
        content_type='text/html')

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

  if not is_dev:
    with open(cache_url, 'w+') as fh:
      fh.write(index.page)

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

async def get_favicon(request):
  favicon = request.app['config']['paths.public'] / 'favicons' / 'favicon.ico'
  return web.FileResponse(favicon)
