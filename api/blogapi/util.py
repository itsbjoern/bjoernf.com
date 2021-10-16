import os
import jwt
import bcrypt
import base64
import json
import bson
from aiohttp import web
import pathlib
import pymongo
import datetime
import math
import shutil
from PIL import Image

PROJECT_ROOT = pathlib.Path(__file__).parent
UPLOAD_FOLDER = PROJECT_ROOT / 'uploads'


class ObjEnconder(json.JSONEncoder):
  def default(self, obj):
    if isinstance(obj, bson.ObjectId):
      return str(obj)
    elif isinstance(obj, pymongo.cursor.Cursor):
      return list(obj)
    elif isinstance(obj, datetime.datetime):
      return obj.timestamp()

    return json.JSONEncoder.default(self, obj)


def dumps(data):
  return json.dumps(data, cls=ObjEnconder)


def json_response(data, **kwargs):
  return web.json_response(data, dumps=dumps, **kwargs)


def get_upload_path(path):
  full_path = UPLOAD_FOLDER / path
  os.makedirs(full_path.parent, exist_ok=True)
  return full_path


def auth(func):
  def route(request):
    if not request.get('user'):
      raise web.HTTPForbidden(reason="No access")
    return func(request)
  return route


def compress_image(path):
  if path.endswith('.backup'):
    return
  backup_path = path + '.backup'
  file_path = path
  if os.path.exists(path + '.backup'):
    file_path = backup_path
  img = Image.open(file_path)
  scale = 800
  ar = scale / max(*img.size, scale)
  new_size = [int(le * ar) for le in img.size]

  shutil.move(path, backup_path)
  try:
    img = img.resize(new_size, Image.ANTIALIAS)
    img.save(path, quality=90, optimize=True)
  except:
    shutil.move(backup_path, path)

def paginate(coll, query, projection=None, page=1, limit=10, items_per_page=10):
  cursor = None
  num_pages = 1
  current_page = 1

  count = coll.count_documents(query)
  num_pages = math.ceil(count / items_per_page)
  skip = (page - 1) * items_per_page
  current_page = 0 if skip == 0 else int(count / skip)
  cursor = coll.find(query, projection) \
               .skip(skip) \
               .limit(min(limit, items_per_page))

  return cursor, num_pages, current_page


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
