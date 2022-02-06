#/bin/bash

export $(cat .env)
envsubst <./database/init.template >./database/00init.sql
docker-compose $@