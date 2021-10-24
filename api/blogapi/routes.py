import pathlib
import os
from .api import index, admin, blog, analytics
import shutil

from aiohttp import web


PROJECT_ROOT = pathlib.Path(__file__).parent
CACHE_ROOT = PROJECT_ROOT / 'node_cache'

def reset_cache():
  if os.path.isdir(CACHE_ROOT):
    shutil.rmtree(CACHE_ROOT)
  os.makedirs(CACHE_ROOT, exist_ok=True)

def setup_routes(app):
  reset_cache()
  app.router.add_get('/favicon.ico', index.get_favicon)

  app.router.add_post('/api/heartbeat', analytics.heartbeat)

  app.router.add_get('/api/blog/posts', blog.get_all_posts_handler)
  app.router.add_get('/api/blog/posts/{id}', blog.get_post_handler)
  app.router.add_get('/api/blog/tags', blog.get_tags)

  app.router.add_post('/api/admin/login', admin.login_handler)
  app.router.add_get('/api/admin/posts', admin.get_drafts)
  app.router.add_post('/api/admin/posts', admin.create_post)
  app.router.add_post('/api/admin/posts/{id}', admin.update_post)
  app.router.add_delete('/api/admin/posts/{id}', admin.delete_post)
  app.router.add_post('/api/admin/posts/{id}/publish', admin.publish)
  app.router.add_post('/api/admin/posts/{id}/unpublish', admin.unpublish)
  app.router.add_post('/api/admin/posts/{id}/upload', admin.upload)
  app.router.add_get('/api/{tail:.*}', index.not_found)

  app.router.add_get('/', index.handler)

  if app['config']['dev']:
    app.router.add_static('/public/',
                          path=PROJECT_ROOT / 'public',
                          name='public',
                          follow_symlinks=True)

    app.router.add_static('/uploads/',
                          path=PROJECT_ROOT / 'uploads',
                          name='uploads')

  app.router.add_get('/{tail:.*}', index.handler)
