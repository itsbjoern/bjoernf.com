#!/bin/sh

mkdir -p /dist/images/
rsync -avz /image-server/images/ /dist/images/
python -m server
