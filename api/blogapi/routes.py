import pathlib
import os
import shutil
from aiohttp import web
from .api import index, blog, analytics, rss, admin


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

  app.router.add_post('/api/admin/index/login', admin.index.login_handler)
  app.router.add_get('/api/admin/blog/posts', admin.blog.get_drafts)
  app.router.add_post('/api/admin/blog/posts', admin.blog.create_post)
  app.router.add_post('/api/admin/blog/posts/{id}', admin.blog.update_post)
  app.router.add_delete('/api/admin/blog/posts/{id}', admin.blog.delete_post)
  app.router.add_post('/api/admin/blog/posts/{id}/publish', admin.blog.publish)
  app.router.add_post('/api/admin/blog/posts/{id}/unpublish', admin.blog.unpublish)
  app.router.add_post('/api/admin/blog/posts/{id}/upload', admin.blog.upload)

  app.router.add_get('/api/admin/analytics/views', admin.analytics.get_analytics)

  app.router.add_get('/api/{tail:.*}', index.not_found)

  app.router.add_get('/rss', rss.create_feed)
  app.router.add_get('/', index.handler)

  app.router.add_get('/{tail:.*}', index.handler)
