#!/usr/bin/env bash

# We assume that all JSDoc summaries include the @author tag.
# By searching for files that don't contain the @author tag,
# we find the files that don't have a JSDoc summary.
# Author: Liam Mulhall <liammulh@gmail.com>

output_files() {
  grep \
  --recursive \
  --include="*.js" \
  --include="*.jsx" \
  --include=".ts" \
  --include=".tsx" \
  --exclude-dir "node_modules" \
  --exclude-dir "scripts" \
  --exclude-dir "dist" \
  --files-without-match \
  "@author"
}

echo "Files without @author:"
output_files
echo "Number of files without @author:"
output_files | wc -l