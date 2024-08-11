FROM oven/bun:1.0.11 AS base
WORKDIR /usr/src/app


FROM base AS fonts
RUN apt-get update
RUN apt-get -y install fontconfig fonts-roboto
RUN fc-cache -fv

FROM base AS install
RUN mkdir -p /temp/prod
COPY package.json bun.lockb /temp/prod/
RUN cd /temp/prod && bun install --frozen-lockfile --production

FROM install AS prerelease
COPY --from=install /temp/prod/node_modules node_modules
COPY . .

COPY ./patches/node.js ./node_modules/astro/dist/core/app/node.js

ENV NODE_ENV=production
RUN bun run build

FROM base AS release
COPY --from=install /temp/prod/node_modules node_modules
COPY --from=prerelease /usr/src/app/dist .
COPY --from=fonts /usr/share/fonts /usr/share/fonts
COPY --from=fonts /etc/fonts /etc/fonts

USER bun
ENV HOST=0.0.0.0
ENV PORT=80
EXPOSE 80/tcp

CMD ["bun", "run", "--bun", "server/entry.mjs"]