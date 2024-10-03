#!/bin/sh

docker-compose -f ~/backend-express/docker-compose.yaml down
docker system prune
