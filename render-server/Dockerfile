# syntax=docker/dockerfile:1
FROM node:16-alpine
RUN apk --no-cache add rsync
WORKDIR /render-server
COPY package.json package.json
RUN yarn
COPY js js
COPY index.js index.js
COPY start.sh start.sh
CMD ["./start.sh"]
