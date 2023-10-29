# syntax=docker/dockerfile:1
FROM oven/bun:latest
COPY dist/server server
COPY package.json ./
COPY bun.lockb ./
RUN bun install

CMD ["bun", "run", "server/entry.mjs"]
