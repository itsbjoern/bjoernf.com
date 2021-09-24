# syntax=docker/dockerfile:1
FROM node:16-alpine
WORKDIR /web
COPY yarn.lock yarn.lock
COPY package.json package.json
RUN yarn
COPY . .
CMD ["yarn", "run", "build"]