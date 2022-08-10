"""
Base utility functions
"""
import json
import datetime
import math
import bson
from aiohttp import web
import pymongo


class ObjEnconder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, bson.ObjectId):
            return str(obj)
        elif isinstance(obj, pymongo.cursor.Cursor):
            return list(obj)
        elif isinstance(obj, datetime.datetime):
            return obj.timestamp()

        return json.JSONEncoder.default(self, obj)


def dumps(data):
    return json.dumps(data, cls=ObjEnconder)


class JsonResponse(web.Response):
    def __init__(self, data, *, text=None, status=200, reason=None, headers=None, content_type="application/json"):
        text = dumps(data)
        super().__init__(text=text, body=None, status=status,
                         reason=reason, headers=headers, content_type=content_type)
        self.json = data


def json_response(data, **kwargs):
    return JsonResponse(data, **kwargs)


def paginate(coll, query, projection=None, page=1, limit=10, items_per_page=10):
    cursor = None
    num_pages = 1
    current_page = 1

    count = coll.count_documents(query)
    num_pages = math.ceil(count / items_per_page)
    skip = (page - 1) * items_per_page
    current_page = 0 if skip == 0 else int(count / skip)
    cursor = coll.find(query, projection) \
                 .skip(skip) \
                 .limit(min(limit, items_per_page))

    return cursor, num_pages, current_page
