#!/usr/bin/env bash

# Copyright 2023, University of Colorado Boulder
# Print a list of Babel files that have been changed since
# the given date.
# Author: Liam Mulhall <liammulh@gmail.com>

DATE="2023-02-20"

cd ../babel || exit
git log --pretty=format: --name-only --since="$DATE" | sort -u