"""
Aiohttp middleware configuration for CORS, auth etc
"""
from aiohttp import web
from aiohttp.web_exceptions import HTTPException
from aiohttp_middlewares import cors_middleware
from aiohttp_middlewares.cors import DEFAULT_ALLOW_HEADERS


async def error_middleware(app, handler):
    async def mid(request):
        try:
            return await handler(request)
        except HTTPException as exception:
            return web.Response(status=exception.status, reason=exception.reason, text=exception.text)
    return mid


async def easy_access_middleware(app, handler):
    async def mid(request):
        setattr(request, 'use', lambda x: request.app[x])
        return await handler(request)
    return mid


async def auth_middleware(app, handler):
    async def mid(request):
        auth_header = request.headers.get('Authorization', None)
        if auth_header:
            db = request.use('db')
            user = db.users.find_one({'token': auth_header[7:]})
            if user:
                request['user'] = user
            else:
                raise web.HTTPUnauthorized()
        return await handler(request)
    return mid


def setup_middlewares(app):
    origins = [app['config']['connection.webhost']]
    app.middlewares.extend([
        cors_middleware(
            origins=origins,
            allow_headers=DEFAULT_ALLOW_HEADERS,
        ),
        error_middleware,
        easy_access_middleware,
        auth_middleware,
    ])
