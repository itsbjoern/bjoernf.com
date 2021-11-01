from aiohttp import web
from blogapi import util


async def login_handler(request):
  auth_header = request.headers.get('Authorization', None)
  if auth_header:
    raise web.HTTPBadRequest(reason="Already logged in")

  data = await request.json()

  username = data.get('username')
  password = data.get('password')
  if not username or not password:
    raise web.HTTPBadRequest(reason="Username and password are required")

  db = request.use('db')
  user = db.users.find_one({'username': username})
  if not user:
    raise web.HTTPBadRequest(reason="User not found")

  is_valid = util.check_password_hash(user['password'], password)
  if not is_valid:
    raise web.HTTPBadRequest(reason="Incorrect login credentials")

  auth = request.use('auth')
  token = auth.create_user_token(user)
  db.users.update_one({'_id': user['_id']}, {'$set': {'token': token}})

  return util.json_response({'user': user, 'token': token})
