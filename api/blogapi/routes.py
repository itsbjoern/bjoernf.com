import pathlib
from .api import index


PROJECT_ROOT = pathlib.Path(__file__).parent


def setup_routes(app):
    app.router.add_get('/', index.handler)
    setup_static_routes(app)

def setup_static_routes(app):
    app.router.add_static('/public/',
                        path=PROJECT_ROOT / 'public',
                        name='public')