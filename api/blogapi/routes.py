import pathlib
from .api import index, admin


PROJECT_ROOT = pathlib.Path(__file__).parent


def setup_routes(app):
  app.router.add_get('/', index.handler)

  app.router.add_post('/admin/login', admin.login_handler)
  app.router.add_get('/admin/posts', admin.get_all_posts_handler)

  app.router.add_static('/public/',
                        path=PROJECT_ROOT / 'public',
                        name='public')
