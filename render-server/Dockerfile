# syntax=docker/dockerfile:1
FROM node:16-alpine
WORKDIR /render-server
COPY package.json package.json
RUN yarn
COPY . .
CMD ["yarn", "run", "deploy"]
