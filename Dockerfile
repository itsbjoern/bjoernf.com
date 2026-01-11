FROM oven/bun:1 AS base
WORKDIR /app

FROM base AS install
RUN mkdir -p /temp/dev
COPY package.json bun.lockb /temp/dev/
RUN cd /temp/dev && bun install --frozen-lockfile

# install with --production (exclude devDependencies)
RUN mkdir -p /temp/prod
COPY package.json bun.lockb /temp/prod/
RUN cd /temp/prod && bun install --frozen-lockfile --production

# copy node_modules from temp directory
# then copy all (non-ignored) project files into the image
FROM base AS prerelease
RUN apt-get update && apt-get install -y libfontconfig1
COPY --from=install /temp/dev/node_modules node_modules
COPY . .

# [optional] tests & build
ENV NODE_ENV=production
RUN bun --bun run build

# copy production dependencies and source code into final image
FROM base AS release
WORKDIR /home/bun/app
RUN mkdir data
RUN chown -R bun:bun /home/bun/app

USER bun

COPY --from=install /temp/prod/node_modules node_modules
COPY --from=prerelease /app/dist/server ./dist/server
COPY --from=prerelease /app/drizzle ./drizzle

EXPOSE 4321/tcp
CMD ["bun", "--bun", "./dist/server/entry.mjs"]
