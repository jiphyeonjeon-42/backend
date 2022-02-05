#/bin/bash

export $(cat .env)
envsubst <./database/init.template >./database/init.sql
docker-compose $@