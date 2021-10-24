#!/bin/sh

rsync -avz /static/data/ /usr/share/nginx/html/
nginx -g 'daemon off;'
