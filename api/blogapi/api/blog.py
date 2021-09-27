from aiohttp import web
import bson
import pymongo
import re

from blogapi import util


public_projection = {'publishedVersion': 1, 'createdAt': 1, 'draft': True, 'tags': 1}


async def get_all_posts_handler(request):
  db = request.use('db')
  query = {'draft': False}

  projection = public_projection
  if request.get('user'):
    projection = None

  page = int(request.query.get('page', 1))
  search = request.query.get('search', '')
  if search != '':
    rgx = re.compile(search, re.I)
    query = {
      **query,
      '$or': [
        {'publishedVersion.text': {'$regex': rgx}},
        {'publishedVersion.title': {'$regex': rgx}},
        {'publishedVersion.tags': {'$regex': rgx}}
      ]
    }

  limit = int(request.query.get('limit', 10))
  paginated = util.paginate(db.posts,
                            query,
                            page=page,
                            limit=limit,
                            projection=projection)

  posts, num_pages, current_page = paginated
  posts = posts.sort('createdAt', pymongo.DESCENDING)

  return util.json_response({'posts': posts, 'numPages': num_pages, 'page': current_page})


async def get_post_handler(request):
  post_id = request.match_info.get('id', None)
  if not post_id:
    return web.HTTPBadRequest(reason="No post id")

  db = request.use('db')
  query = {'_id': bson.ObjectId(post_id), 'draft': False}
  projection = public_projection

  if request.get('user'):
    del query['draft']
    projection = None

  post = db.posts.find_one(query, projection)
  if not post:
    return web.HTTPNotFound(reason="Post does not exist")

  return util.json_response({'post': post})


async def get_tags(request):
  db = request.use('db')

  query = {}
  if request.get('user'):
    query['draft'] = False

  tags = db.posts.distinct('tags', query)

  return util.json_response({'tags': tags})
