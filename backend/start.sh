#!/bin/bash

yarn global add pm2
pm2-runtime start dist/server.js --name api