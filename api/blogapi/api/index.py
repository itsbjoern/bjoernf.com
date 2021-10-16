import pathlib
import json
import os
from aiohttp import web, ClientSession

PROJECT_ROOT = pathlib.Path(__file__).parent.parent
BUILD_ROOT = PROJECT_ROOT / 'public'


async def handler(request):
  with open(BUILD_ROOT / 'index.html', 'r') as fh:
    return web.Response(
      text=fh.read(),
      content_type='text/html')


async def node_handler(request):
  rel_url = str(request.rel_url)[5:] or '/'
  url = str(request.url)[5:]
  user_agent = request.headers['User-Agent']
  req_data = json.dumps({'url': url, 'rel_url': rel_url, 'userAgent': user_agent})

  session = ClientSession()
  data = None
  node_addr = request.app['config']['node.address']
  node_port = request.app['config']['node.port']
  async with session.post(f'http://{node_addr}:{node_port}/render',
                          data=req_data,
                          headers={'Content-Type': 'application/json'}) as resp:
    data = await resp.json()
  await session.close()

  with open(os.path.join(BUILD_ROOT, 'index-node.html'), 'r') as fh:
    index = fh.read()
    css_folder = BUILD_ROOT / 'static' / 'css'
    css_file = [f for f in os.listdir(css_folder) if f.endswith('.css')][0]
    page = index
    page = page.replace('__CSS_URL__', f'/public/static/css/{css_file}')
    page = page.replace('__SITE_CONTENT__', data['markup'])

    return web.Response(
      text=page,
      content_type='text/html')


async def not_found(request):
  raise web.HTTPNotFound()
