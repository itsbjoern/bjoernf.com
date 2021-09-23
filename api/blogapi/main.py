import logging
import sys

from aiohttp import web

from blogapi.db import mongo_ctx
from blogapi.middlewares import setup_middlewares
from blogapi.routes import setup_routes
from blogapi.settings import get_config
from blogapi import util


async def init_app(argv, config='main.yaml'):
  app = web.Application()
  app['config'] = get_config(config)
  app['auth'] = util.Auth(app['config']['jwt_secret'])

  app.cleanup_ctx.append(mongo_ctx)
  setup_routes(app)
  setup_middlewares(app)

  return app


async def get_app():
  app = await init_app(sys.argv[1:], config='dev.yaml')
  return app


def main(argv):
  app = init_app(argv)
  config = get_config()
  web.run_app(app,
              host=config['host'],
              port=config['port'])


if __name__ == '__main__':
  main()
