from aiohttp import web
import bson
from blogapi import util
from blogapi.utils import auth


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

  is_valid = auth.check_password_hash(user['password'], password)
  if not is_valid:
    raise web.HTTPBadRequest(reason="Incorrect login credentials")

  app_auth = request.use('auth')
  token = app_auth.create_user_token(user)
  db.users.update_one({'_id': user['_id']}, {'$set': {'token': token}})

  return util.json_response({'user': user, 'token': token})


@auth.require
async def change_password(request):
  db = request.use('db')

  data = await request.json()
  user = request.get('user')
  hashed = auth.generate_password_hash(data['password'])

  db.users.update_one({'_id': bson.ObjectId(user['_id'])}, {'$set': {'password': hashed}})

  return util.json_response({})
