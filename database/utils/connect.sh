#!/bin/bash

source ../.env

HOST=127.0.0.1
USER=root
PASSWORD=$MYSQL_ROOT_PASSWORD
DATABASE=$MYSQL_DATABASE

mysql \
    --user=$USER --password=$PASSWORD \
    --host=$HOST --port 3306 $DATABASE
