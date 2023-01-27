#!/usr/bin/env bash
# Copyright 2022, University of Colorado Boulder
#
#
# This file defines a bash script that can be used to duplicate a babel subdirectory. This was used for Number Play, when
# translated strings had to be moved to common repos.
#
# @author Marla Schulz (PhET Interactive Simulations)
# @author Chris Klusendorf (PhET Interactive Simulations)
# @author Michael Kauzmann (PhET Interactive Simulations)
#


find . -type f -name 'number-play-string' |
while IFS= read file_name; do
  echo "$file_name"

  #21 characters before adding translation subscript.
  mv "$file_name" "number-suite-common-strings${file_name:21}"
done