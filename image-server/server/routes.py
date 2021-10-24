import pathlib
import os
from .api import index

PROJECT_ROOT = pathlib.Path(__file__).parent


def setup_routes(app):
  app.router.add_get('/{tail:.*}', index.handler)