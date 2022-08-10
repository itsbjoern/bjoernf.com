"""
Utility functions that support authentication
"""

import base64
import jwt
import bcrypt
from aiohttp import web


def generate_password_hash(password, salt_rounds=12):
    password_bin = password.encode('utf-8')
    hashed = bcrypt.hashpw(password_bin, bcrypt.gensalt(salt_rounds))
    encoded = base64.b64encode(hashed)
    return encoded.decode('utf-8')


def check_password_hash(encoded, password):
    password = password.encode('utf-8')
    encoded = encoded.encode('utf-8')

    hashed = base64.b64decode(encoded)
    is_correct = bcrypt.hashpw(password, hashed) == hashed
    return is_correct


def require(func):
    def route(request):
        if not request.get('user'):
            raise web.HTTPForbidden(reason="No access")
        return func(request)
    return route


class Auth():
    def __init__(self, jwt_secret):
        self.jwt_secret = jwt_secret

    def create_user_token(self, user):
        return jwt.encode({"user": str(user['_id'])},
                          self.jwt_secret,
                          algorithm="HS256")
