# syntax=docker/dockerfile:1
FROM oven/bun:latest
COPY dist ./dist
COPY package.json ./
COPY bun.lockb ./
RUN bun install
EXPOSE 80
ENV NODE_ENV=production

CMD ["bun", "run", "dist/server/entry.mjs"]
