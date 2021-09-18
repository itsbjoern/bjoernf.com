import pymongo


async def mongo_ctx(app):
  db = pymongo.MongoClient(host='127.0.0.1', port=27017)
  app['db'] = db

  yield

  db.close()
