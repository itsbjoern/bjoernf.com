"""
Handler for public blog actions such as fetching posts or tags
"""
import re
from aiohttp import web
import bson
import pymongo
from pymongo.collation import Collation

from blogapi import utils
from blogapi.application import BlogRequest


public_projection = {'published': 1, 'createdAt': 1}


async def get_all_posts_handler(request: BlogRequest, return_all=False):
    database = request.app.database
    query = {'published': {'$exists': True}}

    projection = public_projection
    if request.user:
        projection = None

    page = int(request.query.get('page', 1))
    search = request.query.get('search', '')
    tags = request.query.getall('tags', None)
    if search != '':
        rgx = re.compile(search, re.I)
        query = {
            **query,
            '$or': [
                {'published.text': {'$regex': rgx}},
                {'published.title': {'$regex': rgx}},
                {'published.tags': {'$regex': rgx}}
            ]
        }
    elif tags:
        query = {
            **query,
            '$or': [
                {'published.tags': {'$in': tags}}
            ]
        }

    limit = int(request.query.get('limit', 10))
    paginated = utils.paginate(database.posts,
                              query,
                              page=page,
                              limit=limit,
                              projection=projection)

    posts, num_pages, current_page = paginated
    if return_all:
        posts = database.posts.find(query, projection).collation(
            Collation(locale='en', strength=2))

    posts = posts.sort('createdAt', pymongo.DESCENDING)

    return utils.json_response({'posts': list(posts), 'numPages': num_pages, 'page': current_page})


async def get_post_handler(request: BlogRequest):
    post_id = request.match_info.get('id', None)
    if not post_id:
        return web.HTTPBadRequest(reason="No post id")

    database = request.app.database
    query = {'_id': bson.ObjectId(post_id), 'published': {'$exists': True}}
    projection = public_projection

    if request.user:
        del query['published']
        projection = None

    post = database.posts.find_one(query, projection)
    if not post:
        return web.HTTPNotFound(reason="Post does not exist")

    return utils.json_response({'post': post})


async def get_tags(request: BlogRequest):
    database = request.app.database

    tags = database.posts.distinct('published.tags')

    return utils.json_response({'tags': tags})