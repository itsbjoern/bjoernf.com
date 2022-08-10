"""
Handler for post publishing and updating
"""
import re
import datetime
import bson
import pymongo
from aiohttp import web

from blogapi import utils
from blogapi.utils import auth, image


@auth.require
async def create_post(request):
    db = request.use('db')

    insert = {'createdAt': datetime.datetime.utcnow(), 'draft': {}}
    result = db.posts.insert_one(insert)

    return utils.json_response({'post': {'_id': result.inserted_id, **insert}})


@auth.require
async def get_drafts(request):
    db = request.use('db')
    query = {'draft': {'$exists': 1}}

    page = int(request.query.get('page', 1))
    limit = int(request.query.get('limit', 10))
    posts, num_pages, current_page = utils.paginate(
        db.posts, query, page=page, limit=limit)
    posts = posts.sort('createdAt', pymongo.DESCENDING)

    return utils.json_response({'posts': posts, 'numPages': num_pages, 'page': current_page})


@auth.require
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
    return utils.json_response({'post': post})


@auth.require
async def delete_draft(request):
    post_id = request.match_info.get('id', None)
    if not post_id:
        return web.HTTPBadRequest(reason="No post id")

    db = request.use('db')
    db.posts.update_one({'_id': bson.ObjectId(post_id)},
                        {'$unset': {'draft': 1}})
    post = db.posts.find_one({'_id': bson.ObjectId(post_id)})

    return utils.json_response({'post': post})


@auth.require
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
    return utils.json_response({'post': post})


@auth.require
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
    return utils.json_response({'post': post})


@auth.require
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
    return utils.json_response({'post': post})


@auth.require
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

    upload_data = bytearray()
    size = 0
    while True:
        chunk = await field.read_chunk()
        if not chunk:
            break
        size += len(chunk)
        upload_data.extend(chunk)

    adjusted = image.compress_image(upload_data)
    file_url = request.app['aws'].s3_upload_file(
        file_name, adjusted, path='uploads')

    if not file_url:
        return web.HTTPBadRequest(reason="Upload failed")

    return utils.json_response({
        'src': file_url,
        'fileName': file_name,
        'fileSize': size,
    })
