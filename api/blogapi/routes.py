"""
Routing configuration
"""
from .api import blog, rss, admin


def setup_routes(app):
    app.router.add_get('/blog/posts', blog.get_all_posts_handler)
    app.router.add_get('/blog/posts/{id}', blog.get_post_handler)
    app.router.add_get('/blog/tags', blog.get_tags)

    app.router.add_post('/admin/index/login', admin.index.login_handler)
    app.router.add_post('/admin/index/changePassword',
                        admin.index.change_password)
    app.router.add_get('/admin/blog/posts', admin.blog.get_drafts)
    app.router.add_post('/admin/blog/posts', admin.blog.create_post)
    app.router.add_post('/admin/blog/posts/{id}', admin.blog.update_post)
    app.router.add_delete('/admin/blog/posts/{id}', admin.blog.delete_post)
    app.router.add_delete(
        '/admin/blog/posts/{id}/draft', admin.blog.delete_draft)
    app.router.add_post('/admin/blog/posts/{id}/publish', admin.blog.publish)
    app.router.add_post(
        '/admin/blog/posts/{id}/unpublish', admin.blog.unpublish)
    app.router.add_post('/admin/blog/posts/{id}/upload', admin.blog.upload)

    app.router.add_get('/rss', rss.create_feed)
    app.router.add_get('/rss.xml', rss.create_feed)
    app.router.add_get('/rss/{tag}', rss.create_feed)
    app.router.add_get('/rss/{tag}.xml', rss.create_feed)
