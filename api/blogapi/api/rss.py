import xml.etree.cElementTree as ET
from aiohttp import web
from email import utils
import re

from blogapi.api import blog
import xml.etree.ElementTree as ET


ET._original_serialize_xml = ET._serialize_xml


def _serialize_xml(write, elem, *args, **kwargs):
  if elem.tag == '![CDATA[':
    write('<{}{}]]>{}'.format(elem.tag, elem.text, elem.tail or ''))
    return
  return ET._original_serialize_xml(write, elem, *args, **kwargs)


ET._serialize_xml = ET._serialize['xml'] = _serialize_xml


def valid_xml_char_ordinal(text):
  return re.sub(u'[^\u0020-\uD7FF\u0009\u000A\u000D\uE000-\uFFFD\U00010000-\U0010FFFF]+', '', text)


def CDATA(text=None):
  element = ET.Element('![CDATA[')
  element.text = valid_xml_char_ordinal(text)
  return element


def with_cdata(element, text):
  cdata = CDATA(text)
  element.append(cdata)


async def create_feed(request):
  # request.query['limit'] = 100
  post_response = await blog.get_all_posts_handler(request, return_all=True)
  posts = post_response.json['posts']

  config = request.app['config']
  url = config['connection.webhost']

  root = ET.Element("rss", {
    'xmlns:dc': "http://purl.org/dc/elements/1.1/",
    'xmlns:content': "http://purl.org/rss/1.0/modules/content/",
    'xmlns:atom': "http://www.w3.org/2005/Atom",
    'version': "2.0"
  })
  channel = ET.SubElement(root, "channel")
  with_cdata(ET.SubElement(channel, 'title'), 'Björn Friedrichs\' Blog')
  with_cdata(ET.SubElement(channel, 'description'), 'A mere stream of thoughts')
  ET.SubElement(channel, 'link').text = url
  ET.SubElement(channel, 'lastBuildDate').text = utils.format_datetime(posts[0]['published']['publishedAt'])

  for post in posts:
    if 'published' not in post:
      continue
    item = ET.SubElement(channel, "item")
    with_cdata(ET.SubElement(item, 'title'), post['published']['title'])
    with_cdata(ET.SubElement(item, 'description'), post['published']['summary'])
    ET.SubElement(item, 'link').text = f'{url}/post/{post["_id"]}'
    ET.SubElement(item, 'guid', isPermaLink="false").text = f'{url}/post/{post["_id"]}'
    ET.SubElement(item, 'pubDate').text = utils.format_datetime(post['published']['publishedAt'])
    ET.SubElement(item, 'content:encoded').text = valid_xml_char_ordinal(post['published']['html'])

  xml_response = ET.tostring(root, encoding='utf-8').decode()
  return web.Response(
    text=xml_response,
    content_type='application/xml'
  )
