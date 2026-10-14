#!/bin/sh
# Lighthouse mobile + desktop on key pages. Writes $QA_OUT/lh-<name>-<ff>.json
OUT=${QA_OUT:-.}; BASE=${QA_BASE:-http://localhost:3001}
for p in "/|home" "/manifesto|manifesto" "/chapters/ascension|chapter-001" "/artifacts|artifacts" "/circle|circle"; do
  path=${p%%|*}; name=${p##*|}
  npx -y lighthouse@12 "$BASE$path" --quiet --output=json --output-path="$OUT/lh-$name-mobile.json" --chrome-flags="--headless=new" --only-categories=performance,accessibility,best-practices,seo >/dev/null 2>&1
  npx -y lighthouse@12 "$BASE$path" --quiet --preset=desktop --output=json --output-path="$OUT/lh-$name-desktop.json" --chrome-flags="--headless=new" --only-categories=performance,accessibility,best-practices,seo >/dev/null 2>&1
  echo "$name done"
done
