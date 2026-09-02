#!/bin/bash
# Usage: check-links.sh <base-url>
# Example: check-links.sh http://localhost:3000

BASE_URL="${1:-http://localhost:3000}"
EVIDENCE_DIR="/tmp/verify-rizafahmi-web"

mkdir -p "$EVIDENCE_DIR"

echo "Checking internal links from $BASE_URL"

# Key pages to check
PAGES=(
  "/"
  "/articles/"
  "/search/"
  "/showcase/"
  "/tips/"
  "/cv/"
  "/now/"
  "/uses/"
  "/feed.xml"
)

for PAGE in "${PAGES[@]}"; do
  URL="$BASE_URL$PAGE"
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$URL")
  
  if [ "$STATUS" = "200" ]; then
    echo "✓ $PAGE ($STATUS)"
  else
    echo "✗ $PAGE ($STATUS)"
  fi
done

echo "Link check complete. See $EVIDENCE_DIR for captured pages."
