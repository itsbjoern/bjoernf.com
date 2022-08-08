FROM node:18-alpine
WORKDIR /render-server
COPY . .
RUN yarn install
CMD ["yarn", "start", "-p", "80"]
