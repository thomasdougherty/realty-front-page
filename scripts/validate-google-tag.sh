#!/bin/sh

set -eu

tracking_id="G-94JKZE84QY"
tag_host="googletagmanager.com/gtag/js"
status=0
files="${TMPDIR:-/tmp}/google-tag-files.$$"

trap 'rm -f "$files"' EXIT HUP INT TERM

find . -name "*.html" -not -path "./.git/*" | sort > "$files"

while IFS= read -r file; do
  id_count=$(grep -o "$tracking_id" "$file" | wc -l | tr -d " ")
  host_count=$(grep -o "$tag_host" "$file" | wc -l | tr -d " ")

  if [ "$id_count" -ne 2 ]; then
    echo "$file: expected exactly 2 occurrences of $tracking_id, found $id_count"
    status=1
  fi

  if [ "$host_count" -ne 1 ]; then
    echo "$file: expected exactly 1 Google tag script load, found $host_count"
    status=1
  fi

  awk '
    /<head>/ { in_head = 1 }
    /<\/head>/ { in_head = 0 }
    /G-94JKZE84QY/ && !in_head { outside_head = 1 }
    END { exit outside_head ? 1 : 0 }
  ' "$file" || {
    echo "$file: Google tag appears outside the <head>"
    status=1
  }

  awk '
    /<head>/ {
      getline line
      exit line ~ /Google tag \(gtag\.js\)/ ? 0 : 1
    }
  ' "$file" || {
    echo "$file: Google tag comment is not immediately after <head>"
    status=1
  }
done < "$files"

exit "$status"
