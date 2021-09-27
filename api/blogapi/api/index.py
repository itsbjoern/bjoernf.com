import pathlib
import json
from aiohttp import web, ClientSession

PROJECT_ROOT = pathlib.Path(__file__).parent.parent
BUILD_ROOT = PROJECT_ROOT / 'public'
SOURCE_ROOT = PROJECT_ROOT.parent.parent / 'web' / 'node'


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
  async with session.post('http://127.0.0.1:9009/render',
                          data=req_data,
                          headers={'Content-Type': 'application/json'}) as resp:
    data = await resp.json()
  await session.close()

  with open(SOURCE_ROOT / 'index.html', 'r') as fh:
    index = fh.read()
    root_tag = '<div id="root">{}</div>'
    page = index.replace(root_tag.format(''),
                         root_tag.format(data['markup']))
    return web.Response(
      text=page,
      content_type='text/html')


async def not_found(request):
  raise web.HTTPNotFound()
