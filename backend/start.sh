#!/bin/bash

pnpm add --global pm2
pm2-runtime start dist/server.js --name api
