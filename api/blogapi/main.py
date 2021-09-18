import logging
import sys

from aiohttp import web

from blogapi.db import mongo_ctx
from blogapi.middlewares import setup_middlewares
from blogapi.routes import setup_routes
from blogapi.settings import get_config


async def init_app(argv):
    app = web.Application()
    app['config'] = get_config()

    app.cleanup_ctx.append(mongo_ctx)
    setup_routes(app)
    setup_middlewares(app)

    return app


async def get_app():
    """Used by aiohttp-devtools for local development."""
    import aiohttp_debugtoolbar
    app = await init_app(sys.argv[1:])
    aiohttp_debugtoolbar.setup(app)
    return app


def main():
    logging.basicConfig(level=logging.DEBUG)

    app = init_app()
    config = get_config()
    web.run_app(app,
                host=config['host'],
                port=config['port'])


if __name__ == '__main__':
    main()
