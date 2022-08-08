FROM node:18-alpine
WORKDIR /web
COPY package.json package.json
COPY yarn.lock yarn.lock
RUN yarn install
COPY . .
CMD ["yarn", "run", "start"]
