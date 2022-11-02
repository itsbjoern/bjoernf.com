#!/bin/bash

PATHS=("./bin/activate" "./.venv/activate" "../bin/activate" "../../bin/activate" ".venv/bin/activate")

for p in ${PATHS[@]}; do
  if test -f "$p"; then
    echo "Found venv at: \"$p\""
    source $p
    break
  fi
done