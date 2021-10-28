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

  root = ET.Element("rss", {
     'xmlns:dc': "http://purl.org/dc/elements/1.1/",'xmlns:content': "http://purl.org/rss/1.0/modules/content/",'xmlns:atom': "http://www.w3.org/2005/Atom",
     'version': "2.0"
  })
  channel = ET.SubElement(root, "channel")
  ET.SubElement(channel, 'title').text = cdata('Blog | Björn Friedrichs')
  ET.SubElement(channel, 'description').text = 'A mere stream of thoughts'
  ET.SubElement(channel, 'link').text = url
  ET.SubElement(channel, 'lastBuildDate').text = posts[0]['published']['publishedAt'].isoformat()

  for post in posts:
    if 'published' not in post:
      continue
    item = ET.SubElement(channel, "item")
    ET.SubElement(item, 'title').text = cdata(post['published']['title'])
    ET.SubElement(item, 'link').text = f'{url}/post/{post["_id"]}'
    ET.SubElement(item, 'guid', isPermaLink="false").text = f'{url}/post/{post["_id"]}'
    ET.SubElement(item, 'pubDate').text = post['published']['publishedAt'].isoformat()
    ET.SubElement(item, 'description').text = valid_xml_char_ordinal(post['published']['summary'])
    ET.SubElement(item, 'content:encoded').text = valid_xml_char_ordinal(post['published']['html'])

  xml_response = ET.tostring(root).decode()
  return web.Response(
    text=xml_response,
    content_type='text/xml'
  )