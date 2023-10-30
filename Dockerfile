# syntax=docker/dockerfile:1
FROM oven/bun:latest
COPY . .
RUN bun install
RUN bunx --bun astro build
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=80
EXPOSE 80

CMD ["bun", "run", "./dist/server/entry.mjs"]
