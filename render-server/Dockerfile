# syntax=docker/dockerfile:1
FROM node:16-alpine
WORKDIR /render-server
COPY package.json package.json
RUN yarn
COPY js js
COPY index.js index.js
COPY start.sh start.sh
CMD ["./start.sh"]
