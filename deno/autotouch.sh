#!/bin/bash

set -euo pipefail

readonly COMMAND="$1"
readonly LOGFILE="${COMMAND}.bench.log"
readonly INTERVAL="${2:-4}"
readonly FILE_TO_TOUCH="${3:-../backend/src/auth/auth.controller.ts}"

readonly COUNT=100
readonly TOTAL=$((COUNT * INTERVAL))

# show above variables in pretty format
echo "COMMAND       : ${COMMAND}"
echo "INTERVAL      : ${INTERVAL}"
echo "TOTAL         : ${TOTAL}"
echo "FILE_TO_TOUCH : ${FILE_TO_TOUCH}"
echo "LOGFILE       : ${LOGFILE}"

kill_port_user() {
  local -r pid=$(lsof -t -i:3000)
  echo "pid: ${pid}"

  if [[ -z "${pid}" ]]; then
    echo "No process using port 3000"
    return
  fi
  echo "Killing node process using port 3000: ${pid}"
  echo "running kill ${pid}"
  kill "${pid}"
}

run_node() {
  local -r arg="$1"
  local -r logfile="../deno/${LOGFILE}"

  pushd ../backend > /dev/null

  kill_port_user
  echo "Running pnpm ${arg} > ${logfile}"
  pnpm "${arg}" &> "${logfile}"

  popd > /dev/null
}

# trap 'kill_port_user; stty sane; exit 130' SIGINT

run_node "${COMMAND}" &

echo waiting for node to start
sleep 3
echo starting test

for ((i=0; i<COUNT; i++)); do
  ELAPSED=$((i * INTERVAL))
  LEFT=$((TOTAL - ELAPSED))
  ITERATION=$((i + 1))

  printf "iteration: %s/%s, elapsed: %s(s), left: %s(s)\r" "${ITERATION}" "${COUNT}" "${ELAPSED}" "${LEFT}"
  touch "${FILE_TO_TOUCH}"
  sleep "${INTERVAL}"
done

echo

kill_port_user
deno task report ${LOGFILE}
