# syntax=docker/dockerfile:1
FROM oven/bun:latest
COPY dist ./
COPY package.json ./
COPY bun.lockb ./
RUN bun install
ENV NODE_ENV=production

CMD ["bun", "run", "dist/server/entry.mjs"]
