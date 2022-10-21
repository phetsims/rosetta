#!/usr/bin/env bash

# This script switches your new and old Rosetta config.
# This script isn't fool-proof.
# Don't use it unless you've made a copy of your configs.
# Author: Liam Mulhall <liammulh@gmail.com>

USAGE="provide either -n to switch to new config or -o to switch to old config"

while getopts 'hno' OPTION; do
  case "$OPTION" in
    h)
      echo "$USAGE"
      ;;
    n)
      echo "switching to new config"
      cd ~/.phet && mv rosetta-config.json rosetta-config-old.json && mv rosetta-config-new.json rosetta-config.json
      echo "done"
      ;;
    o)
      echo "switching to old config"
      cd ~/.phet && mv rosetta-config.json rosetta-config-new.json && mv rosetta-config-old.json rosetta-config.json
      echo "done"
      ;;
    ?)
      echo "$USAGE"
      exit 1
      ;;
  esac
done