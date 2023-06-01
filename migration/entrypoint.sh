#!/bin/sh

while [ true ]
do
  pnpm db-migrate $1 && exit || sleep 5
  echo 'Wait for database initialize ...'
done
