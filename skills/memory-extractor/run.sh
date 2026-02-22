#!/bin/bash

# Memory Extractor - Runner Script
# Usage: Call this from OpenClaw context, not standalone

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Check if we have session history piped in
if [ -t 0 ]; then
  echo "Error: No session history provided via stdin"
  echo ""
  echo "This script should be called via OpenClaw:"
  echo "  1. Use sessions_history to get recent messages"
  echo "  2. Save to temp file"
  echo "  3. Pipe to this script"
  echo ""
  echo "Example from OpenClaw:"
  echo "  sessions_history → save to /tmp/session.jsonl → exec: cat /tmp/session.jsonl | $0"
  exit 1
fi

# Run the extractor
node "$SCRIPT_DIR/extract.js"
