#!/bin/sh

node scripts/build-node.js
node scripts/build.js

rm -rf ../api/blogapi/public/
mv build ../api/blogapi/public/
