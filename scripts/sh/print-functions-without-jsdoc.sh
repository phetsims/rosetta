#!/usr/bin/env bash

# We assume that a function with a JSDoc comment above it
# would have */ above the function signature. By searching
# for lines with function signatures with a line above them
# that has */, we are finding functions without JSDoc
# comments.
# Author: Liam Mulhall <liammulh@gmail.com>

print_line_before_function_signature() {
  grep \
  --recursive \
  --include="*.js" \
  --include="*.jsx" \
  --include=".ts" \
  --include=".tsx" \
  --exclude-dir "node_modules" \
  --exclude-dir "scripts" \
  --exclude-dir "dist" \
  --before-context=1 \
  --line-number \
  --extended-regexp "const .* = (.*) => {|function .*(.*) {"
}

print_lines_without_jsdoc() {
  print_line_before_function_signature | grep \
  --invert-match \
  "\*/" \
  | grep \
  --invert-match \
  "\-" \
  | grep \
  --invert-match \
  "\-\-"
}

echo "Functions without JSDoc:"
print_lines_without_jsdoc
echo "Number of functions without JSDoc:"
print_lines_without_jsdoc | wc -l