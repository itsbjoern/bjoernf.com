#!/bin/sh

rsync -avz /static/html/ /usr/share/nginx/html/
nginx -g 'daemon off;'
