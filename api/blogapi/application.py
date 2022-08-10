from typing import Optional, cast
from aiohttp import web
from pymongo.collection import Collection # pylint: disable=unused-import # unused because forward declaration!
from pymongo.database import Database

from blogapi.settings import get_config
from blogapi.utils import auth, aws
from blogapi.models import User, Post # pylint: disable=unused-import # unused because forward declaration!


class BlogApplication(web.Application):
    def __init__(self):
        super().__init__()
        self.config = get_config()
        self.auth = auth.Auth(cast(str, self.config['jwt.secret']))
        self.aws = aws.AWS(
            cast(str, self.config['aws.accesskey']),
            cast(str, self.config['aws.secretkey']))
        self.database: BlogDatabase = None  # type: ignore  Database will always be set after context is established

    def as_super(self) -> web.Application:
        return cast(web.Application, self)


class BlogRequest(web.Request):
    app: BlogApplication
    user: Optional[User]


class BlogDatabase(Database):
    users: 'Collection[User]'
    posts: 'Collection[Post]'

    def __bool__(self):
        return True
