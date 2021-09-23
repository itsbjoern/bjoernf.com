import pathlib
from .api import index, admin, blog


PROJECT_ROOT = pathlib.Path(__file__).parent


def setup_routes(app):
  app.router.add_get('/', index.handler)

  app.router.add_get('/blog/posts', blog.get_all_posts_handler)
  app.router.add_get('/blog/posts/{id}', blog.get_post_handler)
  app.router.add_get('/blog/tags', blog.get_tags)

  app.router.add_post('/admin/login', admin.login_handler)
  app.router.add_get('/admin/posts', admin.get_drafts)
  app.router.add_post('/admin/posts', admin.create_post)
  app.router.add_post('/admin/posts/{id}', admin.update_post)
  app.router.add_post('/admin/posts/{id}/publish', admin.publish)
  app.router.add_delete('/admin/posts/{id}/unpublish', admin.unpublish)
  app.router.add_post('/admin/posts/{id}/upload', admin.upload)

  app.router.add_static('/public/',
                        path=PROJECT_ROOT / 'public',
                        name='public')

  app.router.add_static('/uploads/',
                        path=PROJECT_ROOT / 'uploads',
                        name='uploads')
