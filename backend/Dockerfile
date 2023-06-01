FROM node:20-alpine
# https://github.com/pnpm/pnpm/issues/4495#issuecomment-1317831712
ENV PNPM_HOME="/root/.local/share/pnpm"
ENV PATH="${PATH}:${PNPM_HOME}"
RUN npm install --global pnpm

COPY . .
RUN pnpm install

RUN pnpm install --global pm2
RUN pm2-runtime --version || exit 1

ENTRYPOINT [ "sh", "start.sh"]
