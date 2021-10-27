import re
import bson
import os


template = """
  <meta name="image" content="{img}">
  <!-- Schema.org for Google -->
  <meta itemprop="name" content="{title}">
  <meta itemprop="description" content="{description}">
  <meta itemprop="image" content="imgSrc">

  <!-- Open Graph general (Facebook, Pinterest & Google+) -->
  <meta prefix="og: http://ogp.me/ns#" name="og:type"             content="website">
  <meta prefix="og: http://ogp.me/ns#" name="og:title" content="{title}">
  <meta prefix="og: http://ogp.me/ns#" name="og:description" content="{description}">
  <meta prefix="og: http://ogp.me/ns#" name="og:image" content="{img}">
  <meta prefix="og: http://ogp.me/ns#" name="og:url" content="{url}">
  <meta prefix="og: http://ogp.me/ns#" name="og:site_name" content="{title}">
"""

class Hydrate():
  def __init__(self, request, page):
    self.request = request
    self.page = page
    self.hydrate('meta')

  def hydrate(self, attr, content=None):
    if attr == 'title':
      self.page = self.page.replace('__SITE_TITLE__', self.get_meta(title_override=content)['title'])
    elif attr == 'html':
      self.page = self.page.replace('<div id="root"></div>', '<div id="root">{}</div>'.format(content))
    elif attr == 'script':
      self.page = self.page.replace('__SCRIPT_DATA__', content)
    elif attr == 'meta':
      self.page = self.page.replace('__META_TAGS__', template.format(**self.get_meta()))

  def get_meta(self, title_override=None):
    path = str(self.request.path)
    match = re.match(r'/blog/[a-z0-9]+', path)

    title = '{} - Björn Friedrichs'
    description = 'Personal website and blog by Björn Friedrichs'
    img = 'https://images.bjornf.dev/images/og_img.png'
    url = self.request.url
    if title_override is not None:
      title = title.format(title_override)
    elif path == '/':
      title = title.format('Home')
    elif match:
      db = self.request.use('db')
      post_id = match.group(0).split('/')[-1]
      post = db.posts.find_one({'_id': bson.ObjectId(post_id)})
      if post:
        post_title = post.get('published', post.get('draft', {})).get('title', 'Blog')
        title = title.format(post_title)
      else:
        title = title.format('Blog')
    else:
      title = title.format(path[1:].split('/')[0].capitalize())

    return {
      'title': title,
      'description': description,
      'img': img,
      'url': url,
    }


class IndexHydrate(Hydrate):
  def __init__(self, request):
    page = None
    build_root = request.app['config']['paths.public']
    with open(os.path.join(build_root, 'index.html'), 'r') as fh:
      page = fh.read()

    super().__init__(request, page)

