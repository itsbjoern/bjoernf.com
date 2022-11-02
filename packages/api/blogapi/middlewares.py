"""
Aiohttp middleware configuration for CORS, auth etc
"""
from typing import cast
from aiohttp import web
from aiohttp.web_request import Request
from aiohttp.web_exceptions import HTTPException
from aiohttp_middlewares.cors import cors_middleware, DEFAULT_ALLOW_HEADERS

from blogapi.application import BlogApplication
from blogapi.models import User


async def error_middleware(_app: web.Application, handler):
    async def mid(request: Request):
        try:
            return await handler(request)
        except HTTPException as exception:
            return web.Response(status=exception.status, reason=exception.reason, text=exception.text)
    return mid


async def auth_middleware(app: web.Application, handler):
    async def mid(request: Request):
        auth_header = request.headers.get('Authorization', None)
        setattr(request, 'user', None)
        if auth_header:
            database = cast(BlogApplication, app).database
            user: User = cast(User, database.users.find_one({'token': auth_header[7:]}))
            if user:
                setattr(request, 'user', user)
            else:
                raise web.HTTPUnauthorized()
        return await handler(request)
    return mid


def setup_middlewares(app: BlogApplication):
    origins = []
    if (app.config['isdev']):
        origins.append('http://localhost:3000')
        origins.append('http://localhost:9009')
    else:
        origins = [cast(str, app.config['connection.webhost'])]

    app.middlewares.extend([
        cors_middleware(
            origins=origins,
            allow_headers=DEFAULT_ALLOW_HEADERS,
        ),
        error_middleware,
        auth_middleware,
    ])
