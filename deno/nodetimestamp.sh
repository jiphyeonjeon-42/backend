#!/bin/bash

while IFS= read -r line
do
  if [[ $line == Restarting* ]]; then
    echo "watcher: $(date -u +"%Y-%m-%dT%H:%M:%S.%3NZ") <- $line"
  else
    echo "$line"
  fi
done
