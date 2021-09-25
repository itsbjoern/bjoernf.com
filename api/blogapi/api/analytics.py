from aiohttp import web
from blogapi import util

async def log(request):
  return util.json_response({'ok': True})