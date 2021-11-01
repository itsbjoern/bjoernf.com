from blogapi import util
import datetime


@util.auth
def get_analytics(request):
  days = int(request.query.get('days', 14))
  db = request.use('db')
  now = datetime.datetime.utcnow()
  relevant = now - datetime.timedelta(days=days)
  views = db.analytics.find({'createdAt': {'$gte': relevant}})
  return util.json_response({'views': views})
