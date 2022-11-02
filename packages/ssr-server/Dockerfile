FROM node:18-alpine
WORKDIR /ssr-server
COPY package.json package.json
COPY yarn.lock yarn.lock
RUN yarn install
COPY . .
CMD ["yarn", "start", "-p", "80"]
