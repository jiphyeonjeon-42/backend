#/bin/bash

export $(cat .env)
envsubst <./database/init.template >./database/00_init.sql
docker-compose $@