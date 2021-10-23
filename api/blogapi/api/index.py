import pathlib
import json
import bson
import os
import re
from aiohttp import web, ClientSession

PROJECT_ROOT = pathlib.Path(__file__).parent.parent
BUILD_ROOT = PROJECT_ROOT / 'public'


def inject_title(request, content, form=None):
  url = str(request.path)
  url = url.replace('/node', '')
  match = re.match(r'/blog/[a-z0-9]+', url)
  title = '{} - Björn F'
  if form is not None:
    title = title.format(form)
  elif url == '/':
    title = title.format('Home')
  elif match:
    db = request.use('db')
    post_id = match.group(0).split('/')[-1]
    post = db.posts.find_one({'_id': bson.ObjectId(post_id)})
    if post:
      post_title = post.get('published', post.get('draft', {})).get('title', 'Blog')
      title = title.format(post_title)
    else:
      title = title.format('Blog')
  else:
    title = title.format(url[1:].split('/')[0].capitalize())
  content = content.replace('__SITE_TITLE__', title)
  return content

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
    print(data)
    return await not_found_html(request)

  with open(os.path.join(BUILD_ROOT, 'index.html'), 'r') as fh:
    page = fh.read()
    page = inject_title(request, page)

    page = page.replace('<div id="root"></div>', '<div id="root">{}</div>'.format(data['markup']))
    page = page.replace('__SCRIPT_DATA__', data.get('extraScript', ''))

  return web.Response(
    text=page,
    content_type='text/html')


async def not_found(request):
    raise web.HTTPNotFound()


async def not_found_html(request):
  with open(os.path.join(BUILD_ROOT, 'index.html'), 'r') as fh:
    page = fh.read()
    page = inject_title(request, page, 'Not found')

    page = page.replace('<div id="root"></div>', '<div id="root">{}</div>'.format('404 Page not found'))
    page = page.replace('__SCRIPT_DATA__', '')

    return web.Response(
      text=page,
      content_type='text/html')