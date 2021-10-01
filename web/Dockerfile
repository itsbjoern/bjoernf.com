# syntax=docker/dockerfile:1
FROM node:16-alpine
WORKDIR /web
COPY package.json package.json
RUN yarn
COPY . .
RUN mkdir -p /web/node
CMD ["./build.sh"]