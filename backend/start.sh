#!/bin/bash

yarn global add pm2
yarn build
mkdir dist
pm2-runtime start dist/server.js --name api