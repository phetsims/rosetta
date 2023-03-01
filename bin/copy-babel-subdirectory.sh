#!/usr/bin/env bash
# Copyright 2022, University of Colorado Boulder
#
#
# This file defines a bash script that can be used to duplicate a babel subdirectory. This was used for Number Play, when
# translated strings had to be moved to common repos.
#
# must be run from top level of babel/
#
# @author Marla Schulz (PhET Interactive Simulations)
# @author Chris Klusendorf (PhET Interactive Simulations)
# @author Michael Kauzmann (PhET Interactive Simulations)
#

# parse command line
if [ $# != 2 ]; then
  echo "usage from babel/: copy-babel-subdirectory.sh from-repo to-repo"
  exit 1
fi

fromRepo=$1
fromRepoFilename="$fromRepo-strings_"
toRepo=$2

mkdir "$toRepo" # will error if already exists, but that is ok.
cd "$fromRepo"

find . -type f -name "$fromRepoFilename*" |
while IFS= read file_name; do
  newFileName="../$toRepo/${file_name/$fromRepo/$toRepo}"
  echo $newFileName
  cp "$file_name" "$newFileName"
done