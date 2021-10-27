from .api import index


def setup_routes(app):
  app.router.add_get('/{tail:.*}', index.handler)