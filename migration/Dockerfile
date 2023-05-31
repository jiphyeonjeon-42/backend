FROM node:20-alpine
RUN apk add pnpm --repository=http://dl-cdn.alpinelinux.org/alpine/edge/testing/

COPY . .
RUN pnpm install

ENTRYPOINT [ "/entrypoint.sh" ]
CMD [ "up" ]
