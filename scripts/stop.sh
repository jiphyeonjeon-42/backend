#!/bin/sh

docker-compose -f ~/backend/docker-compose.yaml down
docker system prune