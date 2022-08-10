"""
Establish a MongoDB database connection and set indices
"""
from typing import cast
import pymongo
from pymongo.collation import Collation
from aiohttp import web

from blogapi.utils import auth
from blogapi.application import BlogApplication, BlogDatabase


def ensure_index(database: BlogDatabase):
    database.posts.create_index(name='index1',
                          keys=[
                              ('published.text', pymongo.TEXT),
                          ],
                          default_language='english')
    database.posts.create_index(name='index2',
                          keys=[('createdAt', pymongo.DESCENDING)])
    database.posts.create_index(name='index3',
                          keys=[
                              ('published.tags', pymongo.DESCENDING),
                          ],
                          default_language='english',
                          collation=Collation(locale='en', strength=2))


async def mongo_ctx(app: web.Application):
    b_app = cast(BlogApplication, app)
    client = pymongo.MongoClient(cast(str, b_app.config['mongo.url']))
    database = cast(BlogDatabase, client[cast(str, b_app.config['mongo.db'])])
    ensure_index(database)
    app.database = database

    if not database.users.find_one():
        database.users.insert_one({
            'username': b_app.config['mongo.user.username'],
            'password': auth.generate_password_hash(cast(str, b_app.config['mongo.user.password']))
        })

    yield
