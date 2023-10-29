# syntax=docker/dockerfile:1
FROM oven/bun:latest
COPY dist ./dist
COPY package.json ./
COPY bun.lockb ./
RUN bun install
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=80
EXPOSE 80

CMD ["bun", "run", "./dist/server/entry.mjs"]
