import pymongo


def ensure_index(db):
  db.posts.create_index(name='index1',
                        keys=[
                          ('publishedVersion.text', pymongo.TEXT),
                        ],
                        default_language='english')
  db.posts.create_index(name='index2',
                        keys=[('createdAt', pymongo.DESCENDING)])


async def mongo_ctx(app):
  client = pymongo.MongoClient(host='127.0.0.1', port=27017)
  db = client[app['config']['mongo']['db']]
  ensure_index(db)
  app['db'] = db

  yield
