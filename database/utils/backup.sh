#!/bin/bash

# MODE: RDS / local
source ../.env
MODE=$1

case $MODE in
    RDS)
        echo "backup from RDS"
        HOST=$RDS_HOSTNAME
        USER=$RDS_USERNAME
        PASSWORD=$RDS_PASSWORD
        DATABASE=$RDS_DB_NAME
        ;;
    local)
        echo "backup from local"
        HOST=127.0.0.1
        USER=root
        PASSWORD=$MYSQL_ROOT_PASSWORD
        DATABASE=$MYSQL_DATABASE
        ;;
    *)
        echo "invalid mode $MODE: choose between RDS / local"
        exit 1
        ;;
esac

mysqldump \
    --user=$USER --password=$PASSWORD \
    --host=$HOST --port 3306 --databases $DATABASE \
    --result-file=backup.sql

wc backup.sql
