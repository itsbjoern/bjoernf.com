"""
Main application entry point
"""
import os
import sys
import logging
from typing import cast
from aiohttp import web

from subprocess import Popen, DEVNULL

from blogapi.db import mongo_ctx
from blogapi.middlewares import setup_middlewares
from blogapi.routes import setup_routes
from blogapi.settings import get_config
from blogapi.application import BlogApplication


async def init_app() -> BlogApplication:
    app: BlogApplication = BlogApplication()

    app.cleanup_ctx.append(mongo_ctx)
    setup_routes(app)
    setup_middlewares(app)

    return app


async def get_app() -> BlogApplication:
    this_dir = os.path.dirname(os.path.realpath(__file__))
    parent_dir = os.path.join(this_dir, '..')
    Popen(['yarn', 'run', 'schema'], stdout=sys.stdout, stderr=sys.stderr, cwd=parent_dir).communicate()

    app = await init_app()
    return app


def main():
    logging.basicConfig(level=logging.DEBUG)
    app = init_app()
    config = get_config()
    web.run_app(app,
                host=cast(str, config['connection.host']),
                port=cast(int, config['connection.port']))


if __name__ == '__main__':
    main()
