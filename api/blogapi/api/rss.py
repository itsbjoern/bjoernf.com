import xml.etree.cElementTree as ET
from aiohttp import web
import re

from blogapi.api import blog

def valid_xml_char_ordinal(text):
  return re.sub(u'[^\u0020-\uD7FF\u0009\u000A\u000D\uE000-\uFFFD\U00010000-\U0010FFFF]+', '', text)

def cdata(text):
  return f'<![CDATA[ {text} ]]>'

async def create_feed(request):
  page = int(request.query.get('limit', 100))
  post_response = await blog.get_all_posts_handler(request)
  posts = post_response.json['posts']
  num_pages = post_response.json['numPages']

  config = request.app['config']
  url = config['connection.webhost']

  root = ET.Element("rss")
  channel = ET.SubElement(root, "channel")
  ET.SubElement(channel, 'title').text = cdata('Posts | Björn Friedrichs')
  ET.SubElement(channel, 'description').text = 'A mere stream of thoughts'
  ET.SubElement(channel, 'link').text = url
  ET.SubElement(channel, 'lastBuildDate').text = posts[0]['publishedAt']

  for post in posts:
    item = ET.SubElement(root, "item")
    ET.SubElement(item, 'title').text = cdata(post['published']['title'])
    ET.SubElement(item, 'link').text = f'{url}/post/{post["_id"]}'
    ET.SubElement(item, 'guid', isPermaLink=False).text = f'{url}/post/{post["_id"]}'
    ET.SubElement(item, 'pubDate').text = post['publishedAt']
    ET.SubElement(item, 'description').text = post['summary']
    ET.SubElement(item, 'content:encoded').text = post['published']['html']

    fe.description(valid_xml_char_ordinal(post['published']['summary']))
    fe.link(href=f'{url}/post/{post["_id"]}')

  return web.Response(
    text=ET.tostring(root),
    content_type='text/xml'
  )