import jwt
import bcrypt
import base64
import json
import bson
from aiohttp import web
from functools import partial


class ObjEnconder(json.JSONEncoder):
  def default(self, obj):
    if isinstance(obj, bson.ObjectId):
      return str(obj)

    return json.JSONEncoder.default(self, obj)


def dumps(data):
  return json.dumps(data, cls=ObjEnconder)


def json_response(data):
  return web.json_response(data, dumps=dumps)


def auth(func):
  def route(*args, **kwargs):
    print(args, kwargs)
    return func(*args, **kwargs)
  return route


def generate_password_hash(password, salt_rounds=12):
  password_bin = password.encode('utf-8')
  hashed = bcrypt.hashpw(password_bin, bcrypt.gensalt(salt_rounds))
  encoded = base64.b64encode(hashed)
  return encoded.decode('utf-8')


def check_password_hash(encoded, password):
  password = password.encode('utf-8')
  encoded = encoded.encode('utf-8')

  hashed = base64.b64decode(encoded)
  is_correct = bcrypt.hashpw(password, hashed) == hashed
  return is_correct


class Auth():
  def __init__(self, jwt_secret):
    self.jwt_secret = jwt_secret

  def create_user_token(self, user):
    return jwt.encode({"user": str(user['_id'])},
                      self.jwt_secret,
                      algorithm="HS256")
