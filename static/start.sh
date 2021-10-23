#!/bin/sh

rsync -avz ./data/ /usr/share/nginx/html/
nginx -g 'daemon off;'
