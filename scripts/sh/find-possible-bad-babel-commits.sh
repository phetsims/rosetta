#!/usr/bin/env bash

# Copyright 2023, University of Colorado Boulder
# Print the commits in Babel where the number of insertions
# are greater than the number of deletions. I used ChatGPT
# to write this script. I added a few options to the
# git log command to filter out commits not made by phet-dev
# and commits made before we started using Rosetta 2.0.
# Used in https://github.com/phetsims/rosetta/issues/378.
# Author: Liam Mulhall <liammulh@gmail.com>

# Run git log and parse output for commit SHA and insertion/deletion counts.
git log --pretty=format:"%h %ad" --date=short --numstat --author=phet-dev --since=2023-02-21 | awk 'NF==3 {plus+=$1; minus+=$2} NF==2 {print $1,$2,plus,minus; plus=minus=0}' > temp.txt

# Loop through each commit in temp.txt and print the commit SHA if
# deletions > insertions.
while read -r commit date plus minus; do
  if [[ $minus -gt $plus ]]; then
    echo "$commit $date"
  fi
done < temp.txt

rm temp.txt

