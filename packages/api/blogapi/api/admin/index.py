"""
Handler for general admin related tasks
"""
import bson
from aiohttp import web

from blogapi import utils
from blogapi.utils import auth
from blogapi.application import BlogRequest


async def login_handler(request: BlogRequest):
    auth_header = request.headers.get('Authorization', None)
    if auth_header:
        raise web.HTTPBadRequest(reason="Already logged in")

    data = await request.json()

    username: str = data.get('username')
    password = data.get('password')
    if not username or not password:
        raise web.HTTPBadRequest(reason="Username and password are required")

    database = request.app.database
    user = database.users.find_one({'username': username})
    if not user:
        raise web.HTTPBadRequest(reason="User not found")

    is_valid = auth.check_password_hash(user['password'], password)
    if not is_valid:
        raise web.HTTPBadRequest(reason="Incorrect login credentials")

    app_auth = request.app.auth
    token = app_auth.create_user_token(user)
    database.users.update_one({'_id': user['_id']}, {'$set': {'token': token}})

    return utils.json_response({'user': user, 'token': token})


@auth.require
async def change_password(request: BlogRequest):
    database = request.app.database

    data = await request.json()
    user = request.user
    if not user:
        raise web.HTTPForbidden()

    hashed = auth.generate_password_hash(data['password'])

    database.users.update_one({'_id': bson.ObjectId(user['_id'])}, {
                        '$set': {'password': hashed}})

    return utils.json_response({})
