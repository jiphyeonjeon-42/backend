FROM node:18-alpine as pnpm-installed

# https://github.com/pnpm/pnpm/issues/4495#issuecomment-1317831712
ENV PNPM_HOME="/root/.local/share/pnpm"
ENV PATH="${PATH}:${PNPM_HOME}"
RUN npm install --global pnpm
RUN pnpm config set store-dir .pnpm-store
RUN pnpm install --global node-pre-gyp

WORKDIR /app

FROM pnpm-installed as workspace
COPY ./pnpm-lock.yaml .
COPY patches patches

RUN pnpm fetch --prod

FROM workspace as prod
ADD . ./

RUN pnpm -r install --frozen-lockfile --offline --prod
RUN pnpm -r run build

RUN rm -rf /app/.pnpm-store

WORKDIR /app/backend

