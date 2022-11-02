"""
Utility functions that support authentication
"""

import base64
import jwt
import bcrypt
from aiohttp import web

from blogapi import models


def generate_password_hash(password: str, salt_rounds: int=12) -> str:
    password_bin = password.encode('utf-8')
    hashed = bcrypt.hashpw(password_bin, bcrypt.gensalt(salt_rounds))
    encoded = base64.b64encode(hashed)
    return encoded.decode('utf-8')


def check_password_hash(encoded: str, password: str) -> bool:
    hashed = base64.b64decode(encoded.encode('utf-8'))
    is_correct = bcrypt.hashpw(password.encode('utf-8'), hashed) == hashed
    return is_correct


def require(func):
    def route(request):
        if not request.user:
            raise web.HTTPForbidden(reason="No access")
        return func(request)
    return route


class Auth():
    def __init__(self, jwt_secret: str):
        self.jwt_secret: str = jwt_secret

    def create_user_token(self, user: models.User):
        return jwt.encode({"user": str(user['_id'])},
                          self.jwt_secret,
                          algorithm="HS256")
