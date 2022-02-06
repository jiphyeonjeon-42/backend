#!/bin/sh

while [ true ]
do
  yarn db-migrate $1 && exit || sleep 3
  echo 'Wait for database initialize ...'
done
