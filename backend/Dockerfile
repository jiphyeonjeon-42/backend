FROM node:16

COPY . .
RUN npm install -g pm2
RUN yarn

ENTRYPOINT [ "pm2", "start", "yarn", "--name", "api"]