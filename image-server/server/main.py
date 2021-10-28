import logging
import sys
import os
from aiohttp import web

from server.middlewares import setup_middlewares
from server.routes import setup_routes


async def init_app(argv, is_dev=True):
  app = web.Application()
  app['dev'] = is_dev

  setup_routes(app)
  setup_middlewares(app)

  return app

async def get_app():
  os.makedirs('./server/dist/uploads', exist_ok=True)
  os.makedirs('./server/dist/images', exist_ok=True)
  os.makedirs('./server/dist/cache', exist_ok=True)
  app = await init_app(sys.argv[1:])
  return app


def main(argv):
  os.makedirs('/dist/images', exist_ok=True)
  os.makedirs('/dist/uploads', exist_ok=True)
  os.makedirs('/dist/cache', exist_ok=True)

  logging.basicConfig(level=logging.DEBUG)
  app = init_app(argv, is_dev=False)

  web.run_app(app,
              host='0.0.0.0',
              port=80)
