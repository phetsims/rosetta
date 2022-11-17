#!/usr/bin/env bash

# Copyright 2022, University of Colorado Boulder
# WARNING: Only run this from the root directory of the rosetta repo.
# This script gets the bare-minimum repo dependencies for rosetta.
# It is meant for use in a production environment, hence cloning with HTTPS.
# Author: Liam Mulhall <liammulh@gmail.com>

function clone_and_update {
  git clone https://github.com/phetsims/"$1".git "$2"
  cd "$2" || exit
  npm install --silent
  cd .. || exit
}

# Change directory into phet root directory.
cd .. || exit

clone_and_update "chipper" "chipper"
clone_and_update "perennial" "perennial"
clone_and_update "perennial" "perennial-alias"