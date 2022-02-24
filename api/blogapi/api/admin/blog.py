from aiohttp import web
import datetime
import bson
import os
import re
import pymongo

from blogapi import util


@util.auth
async def create_post(request):
  db = request.use('db')

  insert = {'createdAt': datetime.datetime.utcnow(), 'draft': {}}
  op = db.posts.insert_one(insert)

  return util.json_response({'post': {'_id': op.inserted_id, **insert}})


@util.auth
async def get_drafts(request):
  db = request.use('db')
  query = {'draft': {'$exists': 1}}

  page = int(request.query.get('page', 1))
  limit = int(request.query.get('limit', 10))
  posts, num_pages, current_page = util.paginate(db.posts, query, page=page, limit=limit)
  posts = posts.sort('createdAt', pymongo.DESCENDING)

  return util.json_response({'posts': posts, 'numPages': num_pages, 'page': current_page})


@util.auth
async def update_post(request):
  data = await request.json()
  allowed_keys = ['title', 'tags', 'text', 'html']
  for key in data.keys():
    if key not in allowed_keys:
      raise web.HTTPBadRequest(reason=f'{key} is not allowed')

  post_id = request.match_info.get('id', None)
  if not post_id:
    return web.HTTPBadRequest(reason="No post id")

  db = request.use('db')
  the_update = {'updatedAt': datetime.datetime.utcnow(),
                **{f'draft.{key}': val for key, val in data.items()}}

  op = db.posts.update_one({'_id': bson.ObjectId(post_id)},
                           {'$set': the_update})
  if op.matched_count == 0:
    return web.HTTPNotFound(reason="Post does not exist")

  post = db.posts.find_one({'_id': bson.ObjectId(post_id)})
  return util.json_response({'post': post})


@util.auth
async def delete_draft(request):
  post_id = request.match_info.get('id', None)
  if not post_id:
    return web.HTTPBadRequest(reason="No post id")

  db = request.use('db')
  db.posts.update_one({'_id': bson.ObjectId(post_id)},
                      {'$unset': {'draft': 1}})
  post = db.posts.find_one({'_id': bson.ObjectId(post_id)})

  return util.json_response({'post': post})


@util.auth
async def publish(request):
  post_id = request.match_info.get('id', None)
  if not post_id:
    return web.HTTPBadRequest(reason="No post id")

  db = request.use('db')
  post = db.posts.find_one({'_id': bson.ObjectId(post_id)})
  if not post:
    return web.HTTPNotFound(reason="Post does not exist")

  published = post.get('published', {})
  draft = post.get('draft', None)
  if draft is None:
    return web.HTTPBadRequest(reason="No staged changes found")

  title = draft.get('title') or published.get('title')
  html = draft.get('html') or published.get('html')
  text = draft.get('text') or published.get('text')
  published_date = published.get('publishedAt', datetime.datetime.utcnow())

  if not title or not html:
    return web.HTTPBadRequest(reason="Title and text are required")

  remove_multi = re.compile(r"\s+")
  summary = '.'.join(text.split('.')[:3]) + '.'
  summary = remove_multi.sub(" ", summary).strip()
  tags = draft.get('tags') or published.get('tags', [])

  version = {
    'title': title,
    'text': text,
    'summary': summary,
    'html': html,
    'tags': tags,
    'publishedAt': published_date,
    'version': published.get('version', 0) + 1
  }

  db.posts.update_one({'_id': bson.ObjectId(post_id)},
                      {'$unset': {'draft': True}, '$set': {'published': version}})

  post = db.posts.find_one({'_id': bson.ObjectId(post_id)})
  return util.json_response({'post': post})


@util.auth
async def unpublish(request):
  post_id = request.match_info.get('id', None)
  if not post_id:
    return web.HTTPBadRequest(reason="No post id")

  db = request.use('db')
  post = db.posts.find_one({'_id': bson.ObjectId(post_id)})
  if not post:
    return web.HTTPNotFound(reason="Post does not exist")

  if post.get('published') is None:
    return web.HTTPBadRequest(reason="Post is not published")

  update = None
  if post.get('draft') is None:
    update = [{'$set': {'draft': '$published'}}, {'$unset': 'published'}]
  else:
    update = {'$unset': {'published': 1}}
  db.posts.update_one({'_id': bson.ObjectId(post_id)},
                      update)

  post = db.posts.find_one(bson.ObjectId(post_id))
  return util.json_response({'post': post})


@util.auth
async def delete_post(request):
  post_id = request.match_info.get('id', None)
  if not post_id:
    return web.HTTPBadRequest(reason="No post id")

  db = request.use('db')
  post = db.posts.find_one({'_id': bson.ObjectId(post_id)})
  if not post:
    return web.HTTPNotFound(reason="Post does not exist")

  if post.get('published') is not None:
    return web.HTTPBadRequest(reason="Cannot delete published posts")

  db.posts.delete_one({'_id': bson.ObjectId(post_id)})
  return util.json_response({'post': post})


@util.auth
async def upload(request):
  post_id = request.match_info.get('id', None)
  if not post_id:
    return web.HTTPBadRequest(reason="No post id")

  db = request.use('db')
  post = db.posts.find_one({'_id': bson.ObjectId(post_id)})
  if not post:
    return web.HTTPNotFound(reason="Post does not exist")

  reader = await request.multipart()
  field = await reader.next()
  if field.name != 'data':
    return web.HTTPBadRequest(reason="Bad request")

  ext = field.filename.split('.')[-1]
  file_name = f'{str(bson.ObjectId())}.{ext}'

  upload_path = request.app['config']['paths.uploads'] / post_id
  os.makedirs(upload_path, exist_ok=True)

  save_path = os.path.join(upload_path, file_name)
  size = 0
  with open(save_path, 'wb') as f:
    while True:
      chunk = await field.read_chunk()
      if not chunk:
          break
      size += len(chunk)
      f.write(chunk)

  upload_src = request.app['config']['connection.imagehost'] + f'/uploads/{post_id}/{file_name}'
  return util.json_response({
    'src': upload_src,
    'fileSize': size,
    'fileName': file_name
  })
