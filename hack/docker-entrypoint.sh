#!/bin/sh

sub_service_pid=""

sub_service_command="HOST=0.0.0.0 PORT=3000 node ./dist/server/entry.mjs"

function init() {
    /bin/sh ./docker-env-write.sh
}

function main {
  init
  echo "Starting service..."
  eval "pnpm run build"
  eval "$sub_service_command &"
  sub_service_pid=$!

  trap cleanup SIGTERM SIGINT
  echo "Running script..."
  while [ true ]; do
      sleep 5
  done
}

function cleanup {
  echo "Cleaning up!"
  kill -TERM $sub_service_pid
}

main