import pathlib
import os
from .api import index, admin, blog, analytics, rss
import shutil

from aiohttp import web

def reset_cache(app):
  if os.path.isdir(app['config']['paths.cache']):
    shutil.rmtree(app['config']['paths.cache'])
  os.makedirs(app['config']['paths.cache'], exist_ok=True)

def setup_routes(app):
  reset_cache(app)
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

  app.router.add_get('/rss', rss.create_feed)
  app.router.add_get('/', index.handler)

  app.router.add_get('/{tail:.*}', index.handler)
