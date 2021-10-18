import pathlib
import json
import bson
import os
import re
from aiohttp import web, ClientSession

PROJECT_ROOT = pathlib.Path(__file__).parent.parent
BUILD_ROOT = PROJECT_ROOT / 'public'


def inject_title(request, content):
  url = str(request.path)
  url = url.replace('/node', '')
  match = re.match(r'/blog/[a-z0-9]+', url)
  title = '{} - Björn F'
  if url == '/':
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
  with open(BUILD_ROOT / 'index.html', 'r') as fh:
    page = fh.read()
    page = inject_title(request, page)
    return web.Response(
      text=page,
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
    page = fh.read()
    page = inject_title(request, page)
    css_folder = BUILD_ROOT / 'static' / 'css'
    css_files = [f for f in os.listdir(css_folder) if f.endswith('.css')]
    css_tags = ''
    css_template = '<link href="/public/static/css/{}" rel="stylesheet">'
    for css_file in css_files:
      css_tags += '\n' + css_template.format(css_file)
    page = page.replace('__CSS_TAGS__', css_tags)
    page = page.replace('__SITE_CONTENT__', data['markup'])

    return web.Response(
      text=page,
      content_type='text/html')


async def not_found(request):
  raise web.HTTPNotFound()
