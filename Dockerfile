FROM node:18.18.2-alpine3.17

COPY . .

RUN npm i -g pnpm

# pnpm 10+ refuses to run dependency postinstall scripts unless approved; none
# of the gated packages here (cypress, puppeteer, @swc/core, esbuild,
# @parcel/watcher) need their postinstall step for a one-shot build.
RUN pnpm i --ignore-scripts

# This image serves the app at the webroot (see CMD below), not under
# /frontend/ like GitHub Pages, so the router's basename must be empty here.
ENV VITE_ROUTER_BASENAME=""

RUN pnpm build

RUN npm i -g serve

EXPOSE 3010

CMD ["serve", "-l", "3010", "-s","build"]