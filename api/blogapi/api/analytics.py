from aiohttp import web
import pathlib
import bson
import json
import datetime

from bson.objectid import ObjectId

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
    data['user'] = user_id

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

  if 'datetime' in data:
    parsed_time = datetime.datetime.strptime(data['datetime'], "%Y-%m-%dT%H:%M:%S.%fZ")
    data['createdAt'] = parsed_time
    del data['datetime']

    try:
      last_event = next(db.analytics.find({'viewId': ObjectId(pageview_id)}).sort('_id', -1).limit(1))
      if last_event:
        duration = data['createdAt'] - last_event['createdAt']
        db.analytics.update_one({'_id': last_event['_id']}, {'$set': {'duration': duration.total_seconds()}})
    except StopIteration:
      pass

  db.analytics.insert_one(data)
  return util.json_response({'ok': True}, headers=headers)
