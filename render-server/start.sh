#!/bin/sh

mkdir -p /render-server/dist/static/js
rsync -avz /render-server/js/ /dist/static/js/
yarn run deploy
