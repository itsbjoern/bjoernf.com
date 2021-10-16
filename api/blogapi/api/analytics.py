from aiohttp import web
import pathlib
import bson
import json
import datetime
import httpagentparser

from blogapi import util

DATA_DIR = pathlib.Path(__file__).parent.parent / 'data'
with open(DATA_DIR / 'countries.json') as fh:
  COUNTRY_DATA = json.load(fh)
with open(DATA_DIR / 'timezones.json') as fh:
  TIMEZONE_DATA = json.load(fh)

schema_template = {
  'browser': {
    'name': str,
    'version': str
  },
  'datetime': str,
  'os': str,
  'path': str,
  'platform': str,
  'referrer': str,
  'screen': {
    'width': int,
    'height': int,
    'orientation': str,
  },
  'sources': {
    '*': str,
  },
  'timezone': str,
  'userAgent': str
}


def check_data(data, schema):
  for key in data:
    schema_key = '*' if '*' in schema else key

    if key not in schema:
      raise web.HTTPBadRequest()
    elif type(schema[schema_key]) == dict:
      check_data(data[key], schema[schema_key])
    elif data[key] is not None and type(data[key]) != schema[schema_key]:
      raise web.HTTPBadRequest()
    elif type(data[key]) == str and len(data[key]) > 250:
      raise web.HTTPBadRequest()


async def heartbeat(request):
  data = await request.json()
  check_data(data, schema_template)

  pageview_id = request.headers.get('Pageview-Id', str(bson.ObjectId()))
  headers = {'Pageview-Id': pageview_id}
  data['viewId'] = bson.ObjectId(pageview_id)

  db = request.use('db')
  user_id = request.get('user', {}).get('_id', None)
  if user_id:
    data['isAdmin'] = True

  if len(data.get('sources', {})) == 0:
    del data['sources']

  for key in list(data.keys()):
    if data.get(key, None) is None:
      del data[key]

  if 'timezone' in data:
    country_code = TIMEZONE_DATA.get(data['timezone'])
    if country_code:
      data['countryCode'] = country_code
      data['country'] = COUNTRY_DATA.get(country_code, None)
      db.analytics.update_many({'viewId': data['viewId'], 'timezone': {'$exists': False}}, {'$set': {
        'country': data['country'],
        'countryCode': data['countryCode'],
        'timezone': data['timezone']
      }})

  if 'datetime' in data:
    parsed_time = datetime.datetime.strptime(data['datetime'], "%Y-%m-%dT%H:%M:%S.%fZ")
    data['createdAt'] = parsed_time
    del data['datetime']

    try:
      last_event = next(db.analytics.find({'viewId': bson.ObjectId(pageview_id)}).sort('_id', -1).limit(1))
      if last_event:
        duration = data['createdAt'] - last_event['createdAt']
        db.analytics.update_one({'_id': last_event['_id']}, {'$set': {'duration': duration.total_seconds()}})
    except StopIteration:
      pass

  db.analytics.insert_one(data)
  return util.json_response({'ok': True}, headers=headers)


async def analytics_middleware(app, handler):
  async def mid(request):
    response = await handler(request)
    path = request.path
    pageview_id = request.headers.get('Pageview-Id', str(bson.ObjectId()))
    response.headers['Pageview-Id'] = pageview_id
    if not path.startswith('/node'):
      return response

    user_agent = request.headers.get('user-agent')
    parsed = httpagentparser.detect(user_agent)
    os = parsed.get('platform', {}).get('name', None)
    bot = parsed.get('bot', False)
    browser_name = parsed.get('browser', {}).get('name', None)
    browser_version = parsed.get('browser', {}).get('version', '').split('.')[0]

    referer = request.headers.get('Referer')
    sources = {key.replace('utm_', ''): value for key, value in request.query.items() if key.startswith('utm_')}
    db = request.use('db')

    data = {
      'createdAt': datetime.datetime.now(),
      'viewId': bson.ObjectId(pageview_id),
      'sources': sources,
      'os': os,
      'path': path.replace('/node', ''),
      'usesNode': True,
      'browser': {
        'name': browser_name,
        'version': browser_version
      },
      'referer': referer,
      'userAgent': user_agent
    }

    if request.get('user'):
      data['isAdmin'] = True

    if bot:
      data['isProbablyBot'] = True

    try:
      last_event = next(db.analytics.find({'viewId': bson.ObjectId(pageview_id)}).sort('_id', -1).limit(1))
      if last_event:
        duration = data['createdAt'] - last_event['createdAt']
        db.analytics.update_one({'_id': last_event['_id']}, {'$set': {'duration': duration.total_seconds()}})
    except StopIteration:
      pass

    db.analytics.insert_one(data)

    return response
  return mid
