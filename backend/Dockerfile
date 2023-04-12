FROM node:19

WORKDIR /app
COPY . /app

RUN yarn install

ENTRYPOINT [ "yarn", "run", "container" ]
