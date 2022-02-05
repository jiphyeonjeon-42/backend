#!/bin/sh

while [ true ]
do
  yarn db-migrate $1 && exit || sleep 1
  echo 'Wait for database initialize ...'
done
