from aiohttp import web


async def not_found(request):
    raise web.HTTPNotFound()
