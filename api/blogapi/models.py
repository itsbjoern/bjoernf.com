from datetime import datetime
from typing import List, TypedDict
from typing_extensions import NotRequired


class Model(TypedDict):
    _id: str


class User(Model):
    username: str
    password: str


class PostContent(TypedDict):
    version: NotRequired[int]
    title: NotRequired[str]
    html: NotRequired[str]
    image: NotRequired[str]
    text: NotRequired[str]
    summary: NotRequired[str]
    tags: NotRequired[List[str]]
    publishedAt: NotRequired[datetime]


class Post(Model):
    draft: NotRequired[PostContent]
    published: NotRequired[PostContent]
