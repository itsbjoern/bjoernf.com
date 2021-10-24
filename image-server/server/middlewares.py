from aiohttp_middlewares import cors_middleware
from aiohttp_middlewares.cors import DEFAULT_ALLOW_HEADERS
import socket


def setup_middlewares(app):
  local = 'http://' + socket.gethostbyname(socket.gethostname()) + ':3000'
  origins = [local, 'https://bjornf.dev']
  app.middlewares.extend([
    cors_middleware(
      origins=origins,
      allow_headers=[*DEFAULT_ALLOW_HEADERS, "Pageview-Id"],
      expose_headers=['Pageview-Id']
    ),
  ])
