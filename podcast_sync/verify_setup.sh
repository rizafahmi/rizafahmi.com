#!/bin/bash
# PodcastSync Setup Verification Script

echo "=========================================="
echo "PodcastSync Setup Verification"
echo "=========================================="
echo ""

# Check Elixir
echo "✓ Checking Elixir installation..."
elixir --version | head -2
echo ""

# Check dependencies
echo "✓ Checking dependencies..."
mix deps.get > /dev/null 2>&1
if [ $? -eq 0 ]; then
  echo "  Dependencies: OK"
else
  echo "  Dependencies: FAILED"
  exit 1
fi
echo ""

# Check compilation
echo "✓ Checking compilation..."
mix compile --warnings-as-errors > /dev/null 2>&1
if [ $? -eq 0 ]; then
  echo "  Compilation: OK (no warnings)"
else
  echo "  Compilation: FAILED or has warnings"
  exit 1
fi
echo ""

# Check database
echo "✓ Checking database..."
if [ -f "podcast_sync_dev.db" ]; then
  echo "  Database file: EXISTS"
  
  # Check schema
  SCHEMA=$(sqlite3 podcast_sync_dev.db ".schema episodes" 2>/dev/null)
  if [ ! -z "$SCHEMA" ]; then
    echo "  Episodes table: EXISTS"
  else
    echo "  Episodes table: MISSING"
    exit 1
  fi
else
  echo "  Database file: MISSING"
  exit 1
fi
echo ""

# Check key files
echo "✓ Checking project structure..."
FILES=(
  "lib/podcast_sync/episode.ex"
  "lib/podcast_sync/youtube_client.ex"
  "lib/podcast_sync/audio_extractor.ex"
  "lib/podcast_sync/rss_generator.ex"
  "lib/podcast_sync/scheduler.ex"
  "lib/podcast_sync_web/controllers/feed_controller.ex"
  "priv/static/audio/.gitkeep"
  ".env.example"
)

ALL_OK=true
for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "  ✓ $file"
  else
    echo "  ✗ $file MISSING"
    ALL_OK=false
  fi
done
echo ""

if [ "$ALL_OK" = false ]; then
  echo "Some files are missing!"
  exit 1
fi

# Check tests
echo "✓ Running tests..."
mix test > /dev/null 2>&1
if [ $? -eq 0 ]; then
  echo "  Tests: PASSED"
else
  echo "  Tests: FAILED"
  exit 1
fi
echo ""

# Check dependencies versions
echo "✓ Checking key dependencies..."
if mix deps | grep -q "xml_builder"; then
  echo "  xml_builder: INSTALLED"
fi
if mix deps | grep -q "req"; then
  echo "  req: INSTALLED"
fi
if mix deps | grep -q "ecto_sqlite3"; then
  echo "  ecto_sqlite3: INSTALLED"
fi
echo ""

echo "=========================================="
echo "✅ ALL CHECKS PASSED!"
echo "=========================================="
echo ""
echo "Setup is complete and verified."
echo "Ready for implementation!"
echo ""
echo "Next steps:"
echo "  1. Copy .env.example to .env"
echo "  2. Add your YouTube API credentials"
echo "  3. Implement module stubs"
echo "  4. Run: mix phx.server"
echo ""
