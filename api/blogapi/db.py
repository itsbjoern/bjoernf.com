import pymongo

from blogapi import util

def ensure_index(db):
  db.posts.create_index(name='index1',
                        keys=[
                          ('publishedVersion.text', pymongo.TEXT),
                        ],
                        default_language='english')
  db.posts.create_index(name='index2',
                        keys=[('createdAt', pymongo.DESCENDING)])


async def mongo_ctx(app):
  client = pymongo.MongoClient(host=app['config']['mongo.host'], port=app['config']['mongo.port'])
  db = client[app['config']['mongo.db']]
  ensure_index(db)
  app['db'] = db

  if not db.users.find_one():
    db.users.insert_one({
      'username': app['config']['mongo.user.username'],
      'password': util.generate_password_hash(app['config']['mongo.user.password'])
    })

  yield
