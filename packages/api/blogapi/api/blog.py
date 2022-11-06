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
    """
    ---
    get:
        description: Return all blog posts based on the query
        parameters:
        -   in: query
            name: page
            required: true
            schema:
                type: number
            description: The page to load
        -   in: query
            name: limit
            required: true
            schema:
                type: number
            description: How many posts to load
        -   in: query
            name: search
            required: true
            schema:
                type: string
            description: A string to be searched
        -   in: query
            name: preview
            required: true
            schema:
                type: boolean
            description: Whether or not to only return preview data
        responses:
            200:
                content:
                    application/json:
                        schema:
                            type: object
                            required:
                                - posts
                                - numPages
                                - page
                            properties:
                                posts:
                                    type: array
                                    items:
                                        "$ref": "#/components/schemas/Post"
                                numPages:
                                    type: number
                                page:
                                    type: number
    """
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

    post_cursor, num_pages, current_page = paginated
    if return_all:
        post_cursor = database.posts.find(query, projection).collation(
            Collation(locale='en', strength=2))

    post_cursor = post_cursor.sort('createdAt', pymongo.DESCENDING)

    preview = request.query.get('preview', False)
    all_posts = []
    for post in post_cursor:
        if preview:
            if post.get('published'):
                del post['published']['text']
                del post['published']['html']
                del post['published']['version']
        all_posts.append(post)

    return utils.json_response({'posts': all_posts, 'numPages': num_pages, 'page': current_page})


async def get_post_handler(request: BlogRequest):
    """
    ---
    get:
        description: Return a single blog post
        parameters:
        -   in: path
            name: id
            required: true
            schema:
                type: string
            description: The post id
        responses:
            200:
                content:
                    application/json:
                        schema:
                            type: object
                            required:
                                - post
                            properties:
                                post:
                                    "$ref": "#/components/schemas/Post"
    """
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
    """
    ---
    get:
        description: A distinct view of all available tags
        responses:
            200:
                content:
                    application/json:
                        schema:
                            type: object
                            properties:
                                tags:
                                    type: array
                                    items:
                                        type: string
    """
    database = request.app.database

    tags = database.posts.distinct('published.tags')

    return utils.json_response({'tags': tags})
