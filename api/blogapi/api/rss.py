from feedgen.feed import FeedGenerator
from aiohttp import web
import re

from blogapi.api import blog

def valid_xml_char_ordinal(text):
  return re.sub(u'[^\u0020-\uD7FF\u0009\u000A\u000D\uE000-\uFFFD\U00010000-\U0010FFFF]+', '', text)

async def create_feed(request):
  page = int(request.query.get('page', 1))
  post_response = await blog.get_all_posts_handler(request)
  posts = post_response.json['posts']
  num_pages = post_response.json['numPages']

  config = request.app['config']
  fg = FeedGenerator()
  url = config['connection.webhost']
  fg.id(url + '/')
  fg.title(f'Posts | Björn Friedrichs | Page {page}')
  fg.description('A mere stream of thoughts')
  fg.author({'name':'Björn Friedrichs'})
  fg.link(href=url, rel='alternate')
  fg.link(href=str(request.url), rel='self')

  fg.link(href=url + f'/rss', rel='first')
  if page != num_pages:
    fg.link(href=url + f'/rss?page={page+1}', rel='next')
  if page != 1:
    fg.link(href=url + f'/rss?page={page-1}', rel='previous')
  fg.link(href=url + f'/rss?page={num_pages}', rel='last')

  fg.language('en')

  for post in posts:
    fe = fg.add_entry()
    fe.id(f'{url}/post/{post["_id"]}')
    fe.title(valid_xml_char_ordinal(post['published']['title']))
    fe.description(valid_xml_char_ordinal(post['published']['summary']))
    fe.link(href=f'{url}/post/{post["_id"]}')

  return web.Response(
    text=fg.atom_str(pretty=True).decode(),
    content_type='text/xml'
  )