import logging
import sys

from aiohttp import web

from blogapi.db import mongo_ctx
from blogapi.middlewares import setup_middlewares
from blogapi.routes import setup_routes
from blogapi.paths import setup_paths
from blogapi.settings import get_config
from blogapi.utils import auth, aws


async def init_app(argv):
  app = web.Application()
  app['config'] = get_config()
  app['auth'] = auth.Auth(app['config']['jwt.secret'])
  app['aws'] = aws.AWS(app['config']['aws.accesskey'], app['config']['aws.secretkey'])

  setup_paths(app)
  app.cleanup_ctx.append(mongo_ctx)
  setup_routes(app)
  setup_middlewares(app)

  return app


async def get_app():
  app = await init_app(sys.argv[1:])
  return app


def main(argv):
  logging.basicConfig(level=logging.DEBUG)
  app = init_app(argv)
  config = get_config()
  web.run_app(app,
              host=config['connection.host'],
              port=config['connection.port'])


if __name__ == '__main__':
  main()
