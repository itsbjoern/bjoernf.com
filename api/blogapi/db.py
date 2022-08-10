"""
Establish a MongoDB database connection and set indices
"""
import pymongo
from pymongo.collation import Collation

from blogapi.utils import auth


def ensure_index(db):
    db.posts.create_index(name='index1',
                          keys=[
                              ('published.text', pymongo.TEXT),
                          ],
                          default_language='english')
    db.posts.create_index(name='index2',
                          keys=[('createdAt', pymongo.DESCENDING)])
    db.posts.create_index(name='index3',
                          keys=[
                              ('published.tags', pymongo.DESCENDING),
                          ],
                          default_language='english',
                          collation=Collation(locale='en', strength=2))


async def mongo_ctx(app):
    client = pymongo.MongoClient(app['config']['mongo.url'])
    database = client[app['config']['mongo.db']]
    ensure_index(database)
    app['db'] = database

    if not database.users.find_one():
        database.users.insert_one({
            'username': app['config']['mongo.user.username'],
            'password': auth.generate_password_hash(app['config']['mongo.user.password'])
        })

    yield
